import * as THREE from '../assets/js/three';
declare var THREE:any;
import { UserService } from '../providers/user-service';
import * as TWEEN from '../assets/js/tween.min.js';
declare var TWEEN:any;
declare var Util:any;
declare var CFG:any;
declare var eventHub:THREE.Object3D;

export class FaceMorph extends  (THREE.Scene as { new(): any; }) {

  public renderTarget:THREE.WebGLRenderTarget;
  private camera:THREE.OrthographicCamera;
  private renderer:THREE.WebGLRenderer;
  private imgTex:THREE.Texture;
  private imgTexLoaded:boolean = false;
  private userService:UserService;
  private eyeL:THREE.Mesh;
  private eyeR:THREE.Mesh;
  private mouth:THREE.Mesh;

  private fw = 480; // face width; size doesn't matter, only need to be equal to crop image size, easy for compare
  private fh = 480; // face height
  private ew = 100; // eye width
  private eh = 75; // eye height
  private mw = 150; // mouth
  private mh = 100;
  private fw_space = 9.6; // face width in blender space (the same in three space)
  private ratio = this.fw_space / this.fw;

  constructor(container:HTMLElement, userService:UserService, renderer:THREE.WebGLRenderer) {
    super();

    this.renderer = renderer;
    this.renderTarget = new THREE.WebGLRenderTarget(250, 250, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000);
    this.camera.position.set( 0, 0, 8 );
    this.userService = userService;
    this.clock = new THREE.Clock();

    // Light
    this.background = new THREE.Color( 0xa0a0a0 );
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
    this.add( ambientLight );
    var light1 = new THREE.DirectionalLight( 0xffffff, 0.2 );
    light1.position.set( 0, 20, 10 );
    this.add( light1 );
    var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
    light2.position.set( 0, 0, 1 ).normalize();
    this.add( light2 );

    let self = this;
    this.userService.cachedFileUrl("facetex_dzmsq.jpg", (resUrl) => {
      self.loadFace(resUrl);
    });

    this.animate = this.animate.bind(this);
    this.animate();
  }

  loadFace(texUrl) {
    let self = this;
    this.imgTex = new THREE.TextureLoader().load( texUrl );
    this.imgTex.wrapS = this.imgTex.wrapT = THREE.RepeatWrapping;
    this.imgTex.anisotropy = 16;
    this.imgTex.repeat.set(1, 1);
    this.imgTex.offset.set(0, 0);

    let faceMat = new THREE.MeshPhongMaterial( {
        map: this.imgTex
    } );

    let loader = new THREE.FBXLoader();
    loader.load("assets/ui3d/face_area.fbx", function (face) {
      
      face.children[0].material = faceMat;
      self.add(face);
      face.position.set(0, 0, -1);
    });

    
  }

  loadEyeModel() {
    let self = this;
    let loader = new THREE.FBXLoader();
    let path = "assets/ui3d/eye_area.fbx";

    loader.load(path, function (eyeModel) {
      self.eyeL = self.loadEye(eyeModel, 123, 202);
      self.eyeR = self.loadEye(eyeModel, 256, 202);
    });
  }

  addMorphTarget(model:THREE.Object3D, baseMesh:THREE.Mesh, objName:string) {
    let altMesh = Util.findChildByName(model.children, objName);
    let position = altMesh.geometry.attributes.position.clone();
    baseMesh.geometry.morphAttributes.position.push(position);
  }

  loadEye(eyeModel, ex, ey) {
    // ex,ey: eye offset x, from right bottom of face, to right bottom of eye

    let eyeTex = this.imgTex.clone();
    eyeTex.needsUpdate = true;
    eyeTex.repeat.set(this.ew/this.fw, this.eh/this.fh);
    eyeTex.offset.set(ex/this.fw, ey/this.fh);

    let material = new THREE.MeshPhongMaterial( {
        map: eyeTex,
        morphTargets: true
    } );

    let self = this;

    let baseMesh = Util.findChildByName(eyeModel.children, "eye");
    
    baseMesh.geometry.morphAttributes.position = [];

    this.addMorphTarget(eyeModel, baseMesh, "eye_0");
    this.addMorphTarget(eyeModel, baseMesh, "eye_1");
    
    let eye = new THREE.Mesh(baseMesh.geometry, material);
    self.add(eye);
    eye.position.x = -(this.fw/2 - this.ew/2) * this.ratio + ex * this.ratio; // move to right bottom, then move offset x,y
    eye.position.y = -(this.fh/2 - this.eh/2) * this.ratio + ey * this.ratio;

    eye.morphTargetInfluences[ 0 ] = 0;
    eye.updateMorphTargets();

    return eye;
  }

  loadMouthModel() {
    let self = this;
    let loader = new THREE.FBXLoader();
    let path = "assets/ui3d/mouth_area.fbx";

    loader.load(path, function (model) {
      self.mouth = self.loadMouth(model, 167, 41);
    });
  }

  loadMouth(mouthModel, mx, my) {
    let tex = this.imgTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(this.mw/this.fw, this.mh/this.fh);
    tex.offset.set(mx/this.fw, my/this.fh);

    let material = new THREE.MeshPhongMaterial( {
        map: tex,
        morphTargets: true
    } );

    let self = this;

    let baseMesh = Util.findChildByName(mouthModel.children, "mouth");
    
    baseMesh.geometry.morphAttributes.position = [];

    this.addMorphTarget(mouthModel, baseMesh, "mouth_0");
    this.addMorphTarget(mouthModel, baseMesh, "mouth_1");
    
    let mouth = new THREE.Mesh(baseMesh.geometry, material);
    self.add(mouth);
    mouth.position.x = -(this.fw/2 - this.mw/2) * this.ratio + mx * this.ratio; // move to right bottom, then move offset x,y
    mouth.position.y = -(this.fh/2 - this.mh/2) * this.ratio + my * this.ratio;

    mouth.morphTargetInfluences[ 0 ] = 0;
    mouth.updateMorphTargets();

    // background
    let backMat = new THREE.MeshPhongMaterial( { color: 0x201010, dithering: true } );
    let mouthBack = new THREE.Mesh(baseMesh.geometry, backMat);
    mouthBack.position.copy(mouth.position);
    mouthBack.position.z -= 0.01;
    self.add(mouthBack);

    return mouth;
  }

  playExpression(expr:string) {
    if (expr == "smile") {
      this.animatePart(this.eyeL, 1);
      this.animatePart(this.eyeR, 1);
      this.animatePart(this.mouth, 0);
    }
    else if (expr == "shout") {
      this.animatePart(this.mouth, 1);
    }
  }

  animatePart(part, index) {
    let posVar = {x:0};
    let posTo = {x:[0, 1, 1, 1, 0]}; // [0,1,1,0] 时间等分成3段，每个节点的量分别是0,1,1,0
    let onUpdate = function () {
      part.morphTargetInfluences[ index ] = posVar.x;
    }

    this.tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo, 1000)
    .start();
  }

  animate() {
    if (this.animate != null) {
      requestAnimationFrame( this.animate );

      // render scene
      this.renderer.render( this, this.camera, this.renderTarget );

      if (this.imgTex != undefined && this.imgTex.image != undefined && !this.imgTexLoaded) {
        // loadEye once imgTex is loaded
        this.imgTexLoaded = true;
        this.loadEyeModel();
        this.loadMouthModel();
      }
    }
  }
}
