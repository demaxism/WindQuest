import * as THREE from '../assets/js/three';
import * as TWEEN from '../assets/js/tween.min.js';
import { ViewBase } from '../views/ViewBase';
import { Land } from '../ingame/Land';
import { UserService } from '../providers/user-service';
declare var TWEEN:any;
declare var THREE:any;
declare var Util:any;
declare var CFG:any;
declare var Sembo:any;

/**
 * View of land model and sembo; it's used to show a land of mine or others or field
 *
 */
export class PlaceView extends ViewBase {

  private effectComposer:THREE.EffectComposer;
  private landId:string;
  private land:Land;
  private userService:UserService;
  private semboSpecCache:Object;
  private mainSemboId:String;
  private fadeFrom = {x:17, y:0, z:-10};
  private fadeTo = {x:0, y:0, z:-5};
  public loadFinish:Function;
  public fadeFinish:Function;
  public fadeOutFinish:Function;
  public isActive:boolean = false; // showing in home-page

  constructor(container:HTMLElement, mainSemboId:String, landId:string, userService:UserService, isActive:boolean = false) {
      super(container);

      this.userService = userService;
      this.semboSpecCache = userService.semboSpecCache;
      let self = this;
      this.isActive = isActive;
      this.landId = landId;

      // Camera
      this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
      let farth = 4.2;
      this.camera.position.set( 0, 4 * farth, 8 * farth );

      this.controls = new THREE.OrbitControls( this.camera );
      this.resetControl();
      this.controls.update();
      this.controls.enabled = false;

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

      this.land = new Land(this.landId, this.userService, (land:Land) => {
        self.add(land);
        self.land = land;
        if (self.isActive) {
          self.land.position.set(self.fadeTo.x, self.fadeTo.y, self.fadeTo.z);
        }
        else {
          self.land.position.set(self.fadeFrom.x, self.fadeFrom.y, self.fadeFrom.z);
        }
        
        if (mainSemboId.length > 1) {
          self.mainSemboId = mainSemboId;
          self.addSembo(mainSemboId, 0, -2);
        }
        else {
          self.loaded();
        }
      });

      this.animate = this.animate.bind(this);
      this.animate();
  }

  private resetControl() {
    this.controls.reset();
    this.controls.target.set( this.fadeTo.x, this.fadeTo.y, this.fadeTo.z );
    Object.assign(this.controls, {
        enableDamping : true,
        dampingFactor : 0.1,
        rotateSpeed : 0.04,
        zoomSpeed : 0.5,
        minDistance: 10,
        maxDistance: 50,
        minPolarAngle: 30 * Math.PI / 180,
        maxPolarAngle: 88 * Math.PI / 180
    });
  }

  private loaded() {
    this.loadFinish();
    if (this.isActive) { // isActive:is current place when home page loaded; otherwise it is offscreen screen
      this.fadeFinish();
      this.controls.enabled = true;
    }
  }

  public fadeIn() {
    this.show();
    this.resetControl();
    this.land.position.set(this.fadeFrom.x, this.fadeFrom.y, this.fadeFrom.z);

    let posVar = {x:this.fadeFrom.x, y:this.fadeFrom.y, z:this.fadeFrom.z};
    let self = this;
    let onUpdate = function () {
      self.land.position.set( posVar.x,  posVar.y,  posVar.z);
    }
    let onFinish = function () {
      self.controls.enabled = true;
      self.fadeFinish();
    }

    this.tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Linear.None)
    .to(this.fadeTo, 700)
    .start();
  }

  fadeOut() {
    this.controls.enabled = false;
    let posVar = 1;
    let self = this;
    let onUpdate = function () {
      self.controls.panWith(-25, 0);
    }
    let onFinish = function () {
      self.fadeOutFinish();
      self.hide();
    }

    this.tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Linear.None)
    .to(10, 400)
    .start();
  }

  addSembo(semboId, x, z) {
      let sembo;
      let self = this;
      let onSemboLoaded = function() {
        sembo.position.set(self.land.posMain.x, self.land.posMain.y, self.land.posMain.z);
        self.semboList.push(sembo);
        self.land.add(sembo);
        self.loaded();
      };
      sembo = new Sembo(semboId, onSemboLoaded, this.semboSpecCache);
      return sembo;
  }

  updateSembo(semboId:String) {
    if (this.mainSemboId != semboId) {
      this.removeSembo();

      if (semboId.length > 1) {
        let sembo;
        let self = this;
        let onSemboLoaded = function() {
          sembo.position.set(0, 0, -2);
          self.semboList.push(sembo);
          self.land.add(sembo);
        };
        sembo = new Sembo(semboId, onSemboLoaded, this.semboSpecCache);
      }
    }
  }

  removeSembo() {
    if (this.semboList.length > 0) {
      let latestAddedSembo = this.semboList.pop();
      this.land.remove(latestAddedSembo);
      latestAddedSembo.destroy();
      latestAddedSembo = null;
    }
  }

  show() {
    if (!this.visible) {
      this.visible = true;
      this.controls.enabled = true;
      this.animate();
    }
  }

  hide() {
    this.visible = false;
    this.controls.enabled = false;
  }

  animate() {
      if (this.animate != null && this.visible) {
        requestAnimationFrame( this.animate );
        this.controls.update();
      }
  }

  destroy() {
    super.destroy();
  }
}