import * as THREE from '../assets/js/three';
import * as TWEEN from '../assets/js/tween.min.js';
import { ViewBase } from '../views/ViewBase';
import { UserService } from '../providers/user-service';
import { Land } from '../ingame/Land';
declare var TWEEN:any;
declare var THREE:any;
declare var Util:any;
declare var CFG:any;
declare var Sembo:any;

/**
 * View of land model and sembo; it's used to show a land of mine or others or field
 *
 */
export class VisitView extends ViewBase {

  private userService:UserService;
  private landId:string;
  private landSemboId:string;
  private selfSemboId:string;
  private land:Land;
  private mainSembo:THREE.Object3D;
  private selfSembo:THREE.Object3D;
  private semboSpecCache:Object;
  private landPos = {x:0, y:0, z:-5};
  public loadFinish:Function;
  public jumpInFinish:Function;

  constructor(container:HTMLElement, userService:UserService) {
      super(container);

      this.userService = userService;
      this.semboSpecCache = userService.semboSpecCache;
      let self = this;

      // Camera
      this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
      let farth = 4.2;
      this.camera.position.set( 0, 4 * farth, 8 * farth );

      this.controls = new THREE.OrbitControls( this.camera );
      this.resetControl();
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

      // user datas
      this.landId = this.userService.visitingPlace.landId;
      this.landSemboId = this.userService.visitingPlace.landSemboId;
      this.selfSemboId = this.userService.activeSemboId;

      // load land
      this.land = new Land(this.landId, this.userService, (land:Land) => {
        self.add(land);
        land.position.set(self.landPos.x, self.landPos.y, self.landPos.z);
        if (self.landSemboId.length > 1)
          self.addSembo(self.landSemboId);
        else {
          self.addSelfSembo();
        }
      });

      this.animate = this.animate.bind(this);
      this.animate();
  }

  private resetControl() {
    this.controls.reset();
    this.controls.target.set( this.landPos.x, this.landPos.y, this.landPos.z );
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

  addSembo(semboId) {
      let sembo;
      let self = this;
      let onSemboLoaded = function() {
        sembo.position.set(self.land.posMain.x, self.land.posMain.y, self.land.posMain.z);
        self.semboList.push(sembo);
        self.land.add(sembo);
        self.addSelfSembo();
      };
      sembo = new Sembo(semboId, onSemboLoaded, this.semboSpecCache);
      this.mainSembo = sembo;
      return sembo;
  }

  addSelfSembo() {
    let self = this;
    let onSemboLoaded = function() {
      self.selfSembo.position.set(self.land.posGuest.x, 20, self.land.posGuest.z);
      self.semboList.push(self.selfSembo);
      self.land.add(self.selfSembo);
      self.loadFinish();

      // face to main sembo
      let dy = -(self.mainSembo.position.x - self.selfSembo.position.x);
      let dx = -(self.mainSembo.position.z - self.selfSembo.position.z);
      let normal = Math.sqrt(dy * dy + dx * dx);
      let radian = Math.acos(dx / normal) + Math.PI;
      if (dy < 0) radian = -radian;
      self.selfSembo.rotation.y = radian;
    };
    this.selfSembo = new Sembo(this.selfSemboId, onSemboLoaded, this.semboSpecCache);
  }

  jumpInSelfSembo() {
    

    let posVar = {x:this.selfSembo.position.x, y:this.selfSembo.position.y, z:this.selfSembo.position.z};
    let posTo = {x:this.selfSembo.position.x, y:this.land.posGuest.y, z:this.selfSembo.position.z};
    let self = this;
    let onUpdate = function () {
      self.selfSembo.position.set( posVar.x,  posVar.y,  posVar.z);
    }
    let onFinish = function () {
      self.jumpInFinish();
    }

    this.tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo, 700)
    .delay(700)
    .start();
  }

  removeLatestAddedSembo() {
      let latestAddedSembo = this.semboList.pop();
      this.land.remove(latestAddedSembo);
      latestAddedSembo.destroy();
      latestAddedSembo = null;
  }

  animate() {
      if (this.animate != null) {
        requestAnimationFrame( this.animate );
        this.controls.update();
      }
  }

  destroy() {
    super.destroy();
  }
}