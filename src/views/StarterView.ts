import * as THREE from '../assets/js/three';
import * as TWEEN from '../assets/js/tween.min.js';
import * as Sembo from '../assets/class/sembo';
import { UserService } from '../providers/user-service';
declare var TWEEN:any;
declare var THREE:any;
declare var Util:any;
declare var CFG:any;
declare var Sembo:any;

/**
 * View of starter page, register first new sembo
 *
 */
export class StarterView extends  (THREE.Scene as { new(): any; }) {

  public camera:THREE.PerspectiveCamera;
  public controls:THREE.OrbitControls;
  private userService:UserService;
  private semboSpecCache:Object;
  private container:HTMLElement; 
  private semboList:Array<any>;
  private nSemboLoaded:number = 0;
  private land:THREE.Object3D;
  private phase:string = "PhaseStart";
  public semboIdList:Array<string> = [];
  public activeSembo:Sembo;
  public activeColor:string;
  public onloadBasePetsFinish:Function;
  
  private fadeFrom = {x:17, y:0, z:-10};

  constructor(container:HTMLElement, userService:UserService) {
      super();

      this.userService = userService;
      this.semboSpecCache = userService.semboSpecCache;
      this.container = container; // Dom
      this.camera;
      this.semboList = [];
      this.semboIdList = [];
      this.controls;
      let self = this;

      // Camera
      this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
      let farth = 8; // 4
      this.camera.position.set( 1 * farth, 3 * farth, 8 * farth );

      this.controls = new THREE.OrbitControls( this.camera );
      this.controls.target.set( 0, 1, 0 );
      Object.assign(this.controls, {
          enableDamping : true,
          dampingFactor : 0.1,
          rotateSpeed : 0.04,
          zoomSpeed : 0,
          minPolarAngle: 70 * Math.PI / 180,
          maxPolarAngle: 70 * Math.PI / 180
      });
      this.controls.update();

      // Light
      var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
      this.add( ambientLight );
      var light1 = new THREE.DirectionalLight( 0xffffff, 0.2 );
      light1.position.set( 0, 20, 10 );
      light1.castShadow = true;
      light1.shadow.camera.top = 18;
      light1.shadow.camera.bottom = -10;
      light1.shadow.camera.left = -12;
      light1.shadow.camera.right = 12;
      light1.shadow.mapSize.width = 512;
      light1.shadow.mapSize.height = 512;
      this.add( light1 );
      var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
      light2.position.set( 0, 0, 1 ).normalize();
      this.add( light2 );

      let loader = new THREE.FBXLoader();
      loader.load('assets/land/ground.fbx', function (object) {
        object.traverse(function(child) {
              if (child.isMesh) {
                  child.castShadow = false;
                  child.receiveShadow = true;
              }
          });
          self.land = object;
          self.add(self.land);
          self.land.position.set(0, 4, 0);
      });

      this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
      this.animate = this.animate.bind(this);
      this.container.addEventListener( 'click', this.onDocumentMouseUp, false );
      this.animate();
  }

  loadBasePets() {
    for (let i = 0; i < this.semboIdList.length; i++) {
      let sembo = this.addSembo(this.semboIdList[i], 0, 0);
      this.semboList.push(sembo);
    }
  }

  loadBasePetsFinish() {
    this.activeSembo = this.semboList[0];
    this.activeSembo.visible = true;
    this.onloadBasePetsFinish();
  }

  addSembo(semboId, x, z) {
    let sembo;
    let self = this;
    let onSemboLoaded = function() {
      sembo.position.set(x, 0, z);
      self.land.add(sembo);
      sembo.rotateY(THREE.Math.degToRad(-90));
      sembo.visible = false;
      self.nSemboLoaded++;

      if (self.nSemboLoaded >= self.semboIdList.length)
        self.loadBasePetsFinish();
    }
    sembo = new Sembo(semboId, onSemboLoaded, this.semboSpecCache);
    console.log(Util.timeStamp());
    console.log("add sembo " + semboId);
    
    return sembo;
  }

  removeLatestAddedSembo() {
      let latestAddedSembo = this.semboList.pop();
      this.land.remove(latestAddedSembo);
      latestAddedSembo.destroy();
      latestAddedSembo = null;
  }

  phaseToChoosePet() {
    if (this.phase == "PhaseModelLoaded") return;
    this.phase = "PhaseModelLoaded";

    let posVar = {x:this.camera.position.x, y:this.camera.position.y, z:this.camera.position.z, r:this.land.rotation.y};
    let posTo = {x:posVar.x / 2.0, y:posVar.y / 2.0, z:posVar.z / 2.0, r:Math.PI / 2};
    let self = this;
    let onUpdate = function () {
      self.camera.position.set( posVar.x,  posVar.y,  posVar.z);
      self.land.rotation.set(self.land.rotation.x, posVar.r, self.land.rotation.z);
    }

    let onComplete = function() {
      self.loadBasePets();
    }

    this.tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .onComplete(onComplete)
    .easing(TWEEN.Easing.Quartic.Out)
    .to(posTo, 1000)
    .start();
  }

  chooseModel(index:number) {
    for (let i = 0; i < this.semboList.length; i++) {
        this.semboList[i].visible = false;
    }
    this.activeSembo = this.semboList[index];
    this.activeSembo.visible = true;
    if (this.activeColor != undefined) this.chooseColor(this.activeColor);
  }

  chooseColor(colorHex:string) {
      this.activeSembo.changeColor(colorHex);
      this.activeColor = colorHex;
  }

  onDocumentMouseUp(event) {
      console.log("onMouseUp");
      event.preventDefault();
  
      // Example of mesh selection/pick:
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      let posX = event.clientX / CFG.zoomRatio - this.container.offsetLeft - CFG.gapX;
      let posY = event.clientY / CFG.zoomRatio - this.container.offsetTop - CFG.gapY
      mouse.x = (posX / this.container.clientWidth) * 2 - 1;
      mouse.y = - (posY / this.container.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
  
      var objs/* THREE.Object3D[] */ = [];
      this.findAllObjects(objs, this);
      var intersects = raycaster.intersectObjects(objs);
      console.log("Scene has " + objs.length + " objects");
      console.log(intersects.length + " intersected objects found")

      for (let i = 0; i < intersects.length; i++) {
          let obj = intersects[i].object;
          if (obj.semboId != undefined) {
              console.log(obj.semboId);
              let found = this.findSembo(obj.semboId);
              if (found != undefined) {
                  found.startAnim("hi");
              }
              break;
          }
      }
  }

  findSembo(semboId) {
      for (let i = 0; i < this.semboList.length; i++) {
          if (this.semboList[i].semboId === semboId) {
              return this.semboList[i];
          }
      }
      return undefined;
  }

  findAllObjects(pred /* THREE.Object3D[] */, parent /*THREE.Object3D*/ ) {
      // NOTE: Better to keep separate array of selected objects
      if (parent.children.length > 0) {
          parent.children.forEach((i) => {
              pred.push(i);
              this.findAllObjects(pred, i);
          });
      }
  }

  animate() {
    if (this.animate != null) {
      requestAnimationFrame( this.animate );
      this.controls.update();
      if (this.land != undefined && this.phase == "PhaseStart") {
        this.land.rotateY(THREE.Math.degToRad(0.5));
      }
    }
  }

  destroy() {
      for (let i = 0; i < this.semboList.length; i++) {
          this.semboList[i].destroy();
      }
      this.semboList = null;
      for( var i = this.children.length - 1; i >= 0; i--) {
          let obj = this.children[i];
          this.remove(obj);
      }
      this.controls.dispose();
      this.container.removeEventListener( 'click', this.onDocumentMouseUp);
      this.camera = null;
      this.controls = null;
      cancelAnimationFrame(this.id);
      this.animate = null;
  }
}