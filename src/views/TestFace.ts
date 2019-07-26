import * as THREE from '../assets/js/three';
declare var THREE:any;
import { UserService } from '../providers/user-service';
import { FaceMorph } from './FaceMorph';
declare var Util:any;
declare var eventHub:THREE.Object3D;

export class TestFace extends  (THREE.Scene as { new(): any; }) {

  protected container:HTMLElement;
  private camera:THREE.OrthographicCamera;
  private renderer:THREE.WebGLRenderer;
  private rtxScene:FaceMorph;

  constructor(container:HTMLElement, userService:UserService, renderer:THREE.WebGLRenderer) {
    super();

    this.renderer = renderer;
    this.container = container;
    this.userService = userService;
    let self = this;

    // Camera
    this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
    let farth = 3;
    this.camera.position.set( 0, 2 * farth, 8 * farth );

    this.controls = new THREE.OrbitControls( this.camera );

    // Light
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
    this.add( ambientLight );
    var light1 = new THREE.DirectionalLight( 0xffffff, 0.2 );
    light1.position.set( 0, 20, 10 );
    this.add( light1 );
    var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
    light2.position.set( 0, 0, 1 ).normalize();
    this.add( light2 );

    // render target
    this.rtxScene = new FaceMorph(undefined, this.userService, this.renderer);

    // obj
    let loader = new THREE.FBXLoader();
    loader.load("assets/ui3d/helmet_head.fbx", function (obj) {
      self.add(obj);
      obj.position.set(0, 0, 0);

      let material = Util.findChildMaterail(obj.children, "base");
      material.map = self.rtxScene.renderTarget;
      material.map.needsUpdate = true;
    });

    this.animate = this.animate.bind(this);
    this.animate();

    // event
    this.on_EVT_BREED = function(event) {
      self.rtxScene.playExpression("shout");
    }
    eventHub.addEventListener("EVT_BREED", this.on_EVT_BREED);
  }

  animate() {
    if (this.animate != null) {
      requestAnimationFrame( this.animate );
      this.controls.update();

      // render scene
      this.renderer.render( this, this.camera );
    }
  }

  destroy() {
    this.controls.dispose();
  }
}