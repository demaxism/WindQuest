import { UserService } from '../providers/user-service';
import { Quest } from '../models/quest';
import { ViewBase } from '../views/ViewBase';
import * as THREE from '../assets/js/three';
import * as TWEEN from '../assets/js/tween.min.js';
declare var TWEEN:any;
declare var THREE:any;
declare var Sembo:any;
import { SailStop } from '../ingame/SailStop';
declare var Util:any;
declare var CFG:any;

/**
 * View of land model and sembo; it's used to show a land of mine or others or field
 *
 */
export class SailView extends ViewBase {

  public stopOnTarget:Function;
  public sceneLoaded:Function;
  public enterFinish:Function;

  private userService:UserService;
  private renderer:THREE.WebGLRenderer;
  private parentView:any;
  private virtualShip:THREE.Group;
  private uniforms:any;
  private water:THREE.Object3D;
  private questData:Quest; // get from backend
  private semboId:string;
  private sembo:THREE.Object3D;
  private semboState:string = "SAILING";
  private jumpEndHeight:number;
  private nLoaded:number = 0;
  private nLoadReq:number = 0;
  private target:SailStop;
  private doStop:boolean = false; // stop if land discovered
  private nFailToFind:number = 0; // n fail to find the next target, by random()
  private sailStopList:any[] = [];
  private enemyList:any[] = [];
  private semboZoffset:number = 60;
  private semboYoffset:number = 3;

  private targetList:any[];
  private targetIndex:number = 1;

  constructor(container:HTMLElement, renderer: THREE.WebGLRenderer, parent:any, userService:UserService) {
      super(container);

      this.isClickSemboEnabled = false;
      this.userService = userService;
      this.renderer = renderer;
      this.parentView = parent;
      let self = this;

      // Camera
      this.camera = new THREE.PerspectiveCamera( 55, this.container.clientWidth / this.container.clientHeight, 1, 20000 );
      this.camera.position.set( -1000, 40, 2000 );

      // targets, 1000 * 1000 base
      this.targetList = [
        {x:92, z:812, i:0}, 
        {x:130, z:541, i:1}, 
        {x:355, z:565, i:2}, 
        {x:413, z:382, i:3},
        {x:655, z:430, i:4},
        {x:904, z:322, i:5},
        {x:767, z:116, i:6},
        {x:559, z:211, i:7},
        {x:398, z:89, i:8},
        {x:175, z:107, i:9},
        {x:65, z:293, i:10},
        {x:193, z:451, i:11},
        {x:442, z:374, i:12},
        {x:476, z:128, i:13},
        {x:701, z:82, i:14},
        {x:910, z:181, i:15},
        {x:809, z:394, i:16},
        {x:818, z:610, i:17},
        {x:704, z:778, i:18},
        {x:485, z:755, i:19},
        {x:407, z:481, i:20},
        {x:169, z:587, i:21},
        {x:173, z:854, i:22},
        {x:425, z:850, i:23},
        {x:560, z:661, i:24},
        {x:626, z:452, i:25},
        {x:830, z:466, i:26},
        {x:913, z:680, i:27},
        {x:848, z:874, i:28},
        {x:596, z:812, i:29},
        {x:343, z:889, i:30}
      ];

      // Light
      // let ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
      // this.add( ambientLight );
      var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
      light2.position.set( 0, 1, 1 ).normalize();
      this.add( light2 );
      this.background = new THREE.Color( 0x86b9ff );
      let light = new THREE.DirectionalLight( 0xffffff, 0.8 );
      this.add( light );

      // fog
      let fogColor = new THREE.Color( 0x86b9ff );
      this.fog = new THREE.Fog(this.background, 0.0025, 1000);
      
      // water
      var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
      let waterTex = new THREE.TextureLoader().load( 'assets/imgs/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      } );
      this.textureList.push(waterTex);
      this.water = new THREE.Water(
        waterGeometry,
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: waterTex,
          alpha: 1.0,
          sunDirection: light.position.clone().normalize(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: this.fog !== undefined
        }
      );

      this.water.rotation.x = - Math.PI / 2;
      this.add( this.water );
      
      // Skybox
      let sky = new THREE.Sky();
      sky.scale.setScalar( 10000 );
      //this.add( sky );
      let uniforms = sky.material.uniforms;
      uniforms[ "turbidity" ].value = 10;
      uniforms[ "rayleigh" ].value = 2;
      uniforms[ "luminance" ].value = 1;
      uniforms[ "mieCoefficient" ].value = 0.005;
      uniforms[ "mieDirectionalG" ].value = 0.8;
      this.uniforms = uniforms;
      let parameters = {
        distance: 400,
        inclination: 0.46,
        azimuth: 0.27
      };

      var theta = Math.PI * ( parameters.inclination - 0.5 );
      var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
      light.position.x = parameters.distance * Math.cos( phi );
      light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
      light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
      sky.material.uniforms[ "sunPosition" ].value = light.position.copy( light.position );
      self.water.material.uniforms[ "sunDirection" ].value.copy( light.position ).normalize();

      this.userService.getQuest("sea_002").subscribe( (data:any) => {
        self.questData = data;
        self.initQuest();
      });

      this.animate = this.animate.bind(this);
  }

  initQuest() {
    for (let i = 0; i < this.questData.patterns.length; i++) {
      let pattern = this.questData.patterns[i];
      if (pattern.landId != null) {
        this.addLand(pattern);
      }
      else {
        this.addLand(pattern, true);
      }
    }
    this.addSembo();
  }

  allLoaded() {
    this.animate();
    // load target index when come back from visit page
    if (this.userService.visitingPlace != undefined) {
      this.targetIndex = this.userService.visitingPlace.targetIndex;
      this.userService.visitingPlace = undefined;
    }

    let start = this.targetList[this.targetIndex];
    this.virtualShip.position.set(start.x * 10 - 5000, this.virtualShip.position.y, start.z * 10 - 5000);
    this.targetIndex++;
    let tg = this.targetList[this.targetIndex];
    let radian = this.rotateYForFaceTo(tg.x * 10 - 5000, tg.z * 10 - 5000);
    this.virtualShip.rotation.y = radian;
    this.faceTo(tg.x * 10 - 5000, tg.z * 10 - 5000, 600);
    this.sceneLoaded(this.parentView);
  }

  addLand(pattern:any, isEnemy:boolean = false) {
    this.nLoadReq++;
    let self = this;
    let land = new SailStop(pattern, this.userService, () => {
      land.scale.set(8, 8, 8);
      land.position.set(30000, 0, -250);
      self.add(land);
      self.sailStopList.push(land);
      self.nLoaded++;
      self.target = land;
      if (self.nLoaded >= self.nLoadReq) {
        self.allLoaded();
      }
    }, isEnemy);
  }

  addEnemy(semboId:string) {
    this.nLoadReq++;
    let sembo;
    let self = this;
    let onSemboLoaded = function() {
      sembo.scale.set(5, 5, 5);
      sembo.position.set(30000, 0, -250);
      self.add(sembo);
      self.semboList.push(sembo);
      self.sailStopList.push(sembo);
      self.nLoaded++;
      if (self.nLoaded >= self.nLoadReq) self.allLoaded();
    };
    sembo = new Sembo(semboId, onSemboLoaded, this.userService.semboSpecCache);
  }

  chooseOtherLand() {
    let choices = [];
    for (let i = 0; i < this.sailStopList.length; i++) {
      let land = this.sailStopList[i];
      if (land.uuid != this.target.uuid) {
        choices.push(land);
      }
    }
    let ranIndex = Math.floor(Math.random() * choices.length);
    return choices[ranIndex];
  }

  addSembo() {
    this.nLoadReq++;
    this.virtualShip = new THREE.Group();
    this.add(this.virtualShip);
    this.semboId = this.userService.activeSemboId;

    let sembo;
    let self = this;
    let onSemboLoaded = function() {
      sembo.scale.set(5, 5, 5);
      sembo.position.set(0, self.semboYoffset, -self.semboZoffset);
      sembo.rotation.y = Math.PI;
      self.virtualShip.add(sembo);
      self.semboList.push(sembo);
      self.sembo = sembo;
      self.nLoaded++;
      if (self.nLoaded >= self.nLoadReq) self.allLoaded();
    };
    sembo = new Sembo(this.semboId, onSemboLoaded, this.userService.semboSpecCache);
  }

  animate() {
    if (this.animate != null) {
      this.onFrame();
      requestAnimationFrame( this.animate );
    }
  }

  public continueSail() {
    this.targetIndex++;
    if (this.targetIndex >= this.targetList.length) this.targetIndex = 0;
    let tg = this.targetList[this.targetIndex];
    this.faceTo(tg.x * 10 - 5000, tg.z * 10 - 5000);
  }

  sail(x, z) {
    let self = this;
    let posVar = {x:this.virtualShip.position.x, y:this.virtualShip.position.y, z:this.virtualShip.position.z};
    let posTo = {x:x, y:this.virtualShip.position.y, z:z};

    let tween;
    let tween2;
    let onUpdate = function () {
      self.virtualShip.position.set(posVar.x, posVar.y, posVar.z);
    }
    let onFinish = function () {
      if (self.doStop) {
        self.target.targetIndex = self.targetIndex;
        // copy sail stop info for visit-page use
        self.userService.visitingPlace = self.target.visitPlaceParam;
        self.stopOnTarget(self.parentView, self.target.isLandEnemy);
        // hide the other land
        let otherLand = self.chooseOtherLand();
        otherLand.position.set(30000, 0, 0);
      }
      else {
        self.continueSail();
      }
    }

    tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 6000)
    .start();

    let onUpdate2 = function () {
      self.camera.position.set(posVar.x, 40, posVar.z);
    }
    tween2 = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate2)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 6000)
    .delay(100)
    .start();
  }

  rotateYForFaceTo(x, z) {
    let dy = -(x - this.virtualShip.position.x);
    let dx = -(z - this.virtualShip.position.z);
    let normal = Math.sqrt(dy * dy + dx * dx);
    let radian = Math.acos(dx / normal);
    if (dy < 0) radian = -radian;

    if (radian - this.virtualShip.rotation.y >= Math.PI) {
      radian -= (Math.PI * 2);
    }

    if (radian - this.virtualShip.rotation.y <= -Math.PI) {
      radian += (Math.PI * 2);
    }
    return radian;
  }

  // place the land slightly beyond the facing target
  placeLandBeyond(x, z, rotY) {
    // check switch target land
    let tx = this.virtualShip.position.x - this.target.position.x;
    let tz = this.virtualShip.position.z - this.target.position.z;
    let tDist = Math.sqrt(tx * tx + tz * tz);
    if (tDist < 300) {
      this.target = this.chooseOtherLand();
    }

    let dx = x - this.virtualShip.position.x;
    let dz = z - this.virtualShip.position.z;
    let dist = Math.sqrt(dx * dx + dz * dz);
    let ratio = (dist + 250) / dist;
    this.target.position.x = this.virtualShip.position.x + dx * ratio;
    this.target.position.z = this.virtualShip.position.z + dz * ratio;
    this.target.rotation.y = rotY;
  }

  faceTo(x, z, sp = null) {
    let span = (sp == null)? 1800 : sp;
    let self = this;

    let radian = this.rotateYForFaceTo(x,z);
    
    let ry = radian - this.virtualShip.rotation.y;
    if (ry > Math.PI) ry -= (Math.PI * 2);
    if (ry < -Math.PI) ry += (Math.PI * 2);

    let rotTo = {y:radian, a:ry};
    let rotVar = {y:this.virtualShip.rotation.y, a:0};

    if (Math.random() < 0.6 || this.nFailToFind >= 3) {
      this.doStop = true;
      this.placeLandBeyond(x, z, radian);
      this.nFailToFind = 0;
    }
    else {
      this.nFailToFind++;
      this.doStop = false;
    }

    let onUpdate = function () {
      self.virtualShip.rotation.y = rotVar.y;
      if (self.virtualShip.rotation.y > Math.PI) self.virtualShip.rotation.y -= (Math.PI * 2);
      if (self.virtualShip.rotation.y < -Math.PI) self.virtualShip.rotation.y += (Math.PI * 2);

      if (Math.abs(rotVar.a) < Math.abs(ry/2)) {
        self.sembo.rotation.z = - rotVar.a * 0.4;
      }
      else {
        self.sembo.rotation.z = - (ry - rotVar.a) * 0.4;
      }
    }
    let onFinish = function () {
      // let tg = self.targetList[self.targetIndex];
      // self.sail(tg.x, tg.z);
    }
    let tween = new TWEEN.Tween(rotVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Cubic.InOut)
    .to(rotTo, span)
    .start();

    let onUpdate2 = function () {
      self.camera.rotation.y = rotVar.y;
      if (self.camera.rotation.y > Math.PI) self.camera.rotation.y -= (Math.PI * 2);
      if (self.camera.rotation.y < -Math.PI) self.camera.rotation.y += (Math.PI * 2);
    }
    let tween2 = new TWEEN.Tween(rotVar)
    .onUpdate(onUpdate2)
    .easing(TWEEN.Easing.Cubic.InOut)
    .to(rotTo, span)
    .delay(100)
    .start();

    this.sail(x,z);
  }

  public enterPlace() {
    this.semboState = "ENTERING";
    let self = this;
    let timeSpan = 1500;
    let tVar = {t:0};
    let tTo = {t:1}; // time span
    let g = 700;
    let endH = 25; // bigger, jump end height high
    let vy = g * tTo.t / 2 + endH; // vertical init v
    let vz = 200 / tTo.t;

    let onUpdate = function () {
      self.sembo.position.y = vy * tVar.t - g * tVar.t * tVar.t / 2;
      self.sembo.position.z = -self.semboZoffset - vz * tVar.t;
    }
    let onFinish = function () {
      self.semboState = "ENTER_END";
      self.jumpEndHeight = self.sembo.position.y;
      self.enterFinish(self.parentView);
    }
    let tween = new TWEEN.Tween(tVar)
    .onUpdate(onUpdate)
    .onComplete(onFinish)
    .easing(TWEEN.Easing.Linear.None)
    .to(tTo, timeSpan)
    .start();
  }

  onFrame() {
    this.nFrame++;
    var time = performance.now() * 0.001;
    this.water.material.uniforms[ "time" ].value += 1.0 / 60.0;
    this.target.position.y = Math.cos( time ) * 2 + 10;

    // let item = {px:this.virtualShip.position.x, ry:this.virtualShip.rotation.y, pz:this.virtualShip.position.z};
    // this.latencyQ.enqueue(item);
    // if (this.latencyQ.getLength() > 0) {
    //   let old = this.latencyQ.dequeue();
    //   this.camera.position.set(old.px, 40, old.pz);
    //   this.camera.rotation.y = old.ry;
    // }
    // console.log("camera y:" + this.camera.position.y + "\tvs y:" + this.virtualShip.position.y);
    if (this.semboState == "SAILING") {
      this.sembo.position.y = Math.cos( time + Math.PI ) * 2 + this.semboYoffset;
    }
    else if (this.semboState == "ENTER_END") {
      this.sembo.rotation.y += 0.1;
      this.sembo.position.y = Math.cos( time * 5 ) * 2 + this.jumpEndHeight;
    }
  }

  destroy() {
    super.destroy();
  }
}