import * as THREE from '../assets/js/three';
import * as TWEEN from '../assets/js/tween.min.js';
import * as Sembo from '../assets/class/sembo';
import { ViewBase } from '../views/ViewBase';
import { UserService } from '../providers/user-service';
import { Bullet } from '../ingame/Bullet';
import { FireBullet } from '../ingame/FireBullet';
import { WaterBullet } from '../ingame/WaterBullet';
import { WoodBullet } from '../ingame/WoodBullet';
import { LightSparkle } from '../ingame/LightSparkle';
import { Egg } from '../ingame/Egg';
declare var TWEEN:any;
declare var THREE:any;
declare var Util:any;
declare var CFG:any;
declare var Sembo:any;

/**
 * View of land model and sembo; it's used to show a land of mine or others or field
 *
 */
export class BattleView extends ViewBase {

  private userService:UserService;
  private selfSemboId:string;
  private selfSembo:Sembo;
  private enemySemboId:string;
  private enemySembo:Sembo;
  private enemyHpBar:THREE.Object3D;
  private distance:number = 20;
  private nTurn:number = 0;
  private semboSpecCache:Object;
  private planeList:Array<THREE.Mesh> = [];
  private tunnel:THREE.Object3D;
  private tunnelRotSpeed:number = 0.001;
  private tunnelMovSpeed:number = 1;
  private nFrame:number = 0;
  private nPlane:number = 400;
  private planeGap:number = 4;
  private ringSelf:THREE.Object3D;
  private ringEnemy:THREE.Object3D;
  private spinPivot:THREE.Object3D;
  private spinRadius:number = 3; // sembo distance from spin center
  private egg:Egg;
  private eggGetting:boolean = false;
  private battleStatus:number = 0; // 0: battle  1:self win  2:self lose
  private cameraLookAt:THREE.Vector3 = new THREE.Vector3(0, 3, -10);
  private isPause:boolean = false;
  private pausePendingAction:Function = () => {};

  private offensor:Sembo;
  private defensor:Sembo;

  public loadFinishAction:Function;
  public updateEnemyUI:Function;
  public updateSemboStatus:Function;
  public victoryAction:Function;
  public eggGetAction:Function;
  public eggOpened:Function;

  constructor(container:HTMLElement, userService:UserService) {
      super(container);

      this.userService = userService;
      this.selfSemboId = this.userService.activeSemboId;
      this.enemySemboId = this.userService.visitingPlace.landSemboId;
      this.semboSpecCache = userService.semboSpecCache;
      this.isClickSemboEnabled = false;
      let self = this;

      // Camera
      this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
      this.camera.position.set( 25, 7, 0 ); // 8 7 17
      this.camera.lookAt(this.cameraLookAt);

      // Light
      var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
      this.add( ambientLight );
      var light1 = new THREE.DirectionalLight( 0xffffff, 0.4 );
      light1.position.set( 0, 20, 10 );
      this.add( light1 );
      var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
      light2.position.set( 0, 0, 1 ).normalize();
      this.add( light2 );

      let bgColor = new THREE.Color( 0x003276 );
      this.background = bgColor;
      this.fog = new THREE.Fog(bgColor, 0.0025, this.nPlane * this.planeGap);

      // ring
      let loader = new THREE.FBXLoader();
      let path = "assets/ui3d/battle_ring.fbx";
      loader.load(path, function (object) {
        object.traverse(function(child) {
          if (child.isMesh) {
              child.castShadow = false;
              child.receiveShadow = true;
          }
        });
        self.ringSelf = object;
        self.add(self.ringSelf);
        self.ringSelf.position.set(0, 0, 0);

        // enemy ring
        self.ringEnemy = object.clone();
        self.add(self.ringEnemy);
        self.ringEnemy.position.set(0, 0, -self.distance);

        self.spinPivot = new THREE.Object3D();
        self.spinPivot.position.copy(self.ringEnemy.position);
        self.add(self.spinPivot);

        self.addSelfSembo();
      });

      // build tunnel
      var plane = new THREE.PlaneGeometry( 5, 5 );

      this.tunnel = new THREE.Object3D();
      this.add(this.tunnel);

      for ( var i = 0; i < this.nPlane; i ++ ) {

        let rr = 50, gg = 75, bb = 230;
        let color1 = new THREE.Color( Math.random() * 0.3 + rr/256, Math.random() * 0.3 + gg/256, Math.random() * 0.3 + bb/256 );
        let material = new THREE.MeshPhongMaterial( 
          { color: color1, flatShading: true, emissive: new THREE.Color(rr/256, gg/256, bb/256), transparent: true
          });

        if (Math.random() < 0.5) {
          material = new THREE.MeshBasicMaterial( 
          { color: color1, wireframe:true
          });
        }
        let object = new THREE.Mesh(plane, material);

        var radius = 50 + ( Math.random() * 150 );

        object.position.x = Math.random() - 0.5;
        object.position.y = Math.random() - 0.5;
        object.position.z = 0;
        object.position.normalize();
        object.position.multiplyScalar( radius );
        object.lookAt( this.position );
        object.position.z = - ( i * this.planeGap );
        let sc = Math.random() * 10;
        object.scale.x = sc;
        object.scale.y = sc;
        object.updateMatrix();
        object.emisScala = 0 + Math.random() * 0.3; // intensity
        object.emisPeriod = 80 + Math.random() * 120; // period nFrame of 2PI
        object.emisPhase = Math.random() * 100; // phase

        this.tunnel.add(object);
        this.planeList.push(object);
      }

      this.animate = this.animate.bind(this);
      this.animate();
  }

  private resetControl() {
    this.controls.reset();
    this.controls.target.set( 0, 2, -10 );
    Object.assign(this.controls, {
        enableDamping : true,
        dampingFactor : 0.2,
        rotateSpeed : 0.01,
        zoomSpeed : 0.5,
        minDistance: 10,
        maxDistance: 50,
        minPolarAngle: 65 * Math.PI / 180,
        maxPolarAngle: 80 * Math.PI / 180
    });
  }

  private addSelfSembo() {
    let self = this;
    let onSemboLoaded = function() {
      self.semboList.push(self.selfSembo);
      self.add(self.selfSembo);
      self.selfSembo.position.copy(self.ringSelf.position);
      self.selfSembo.rotation.y = Math.PI;
      self.addEnemySembo();
    };
    this.selfSembo = new Sembo(this.selfSemboId, onSemboLoaded, this.semboSpecCache);
    this.userService.selfSembo = this.selfSembo;
  }

  private addEnemySembo() {
    let self = this;
    let onSemboLoaded = function() {
      self.semboList.push(self.enemySembo);
      self.add(self.enemySembo);
      self.enemySembo.position.copy(self.ringEnemy.position);

      // hp position empty object, battle-page will get this position
      self.enemyHpBar = new THREE.Object3D();
      self.add(self.enemyHpBar);
      self.enemyHpBar.position.copy(self.ringEnemy.position);
      let h = self.enemySembo.dimension.y;
      self.enemyHpBar.position.y += (h + 1);
      
      self.loadFinish();
    }
    this.enemySembo = new Sembo(this.enemySemboId, onSemboLoaded, this.semboSpecCache);
    this.userService.enemySembo = this.enemySembo;
  }

  private loadFinish() {
    this.loadFinishAction();
    let self = this;
    self.offensor = self.selfSembo;
    self.defensor = self.enemySembo;
    self.initBullet();
    setTimeout(() => {
      self.cameraSet();
    }, 1000);

    this.updateSemboStatus();
  }

  private createBullet(type:number, distance:number, dim1:any, dim2:any) {
    if (type == 100) {
      return new FireBullet(distance, dim1, dim2);
    }
    else if (type == 200) {
      return new WaterBullet(distance, dim1, dim2);
    }
    else if (type == 300) {
      return new WoodBullet(distance, dim1, dim2);
    }
  }

  private initBullet() {
    // self bullet
    let bullet:Bullet = this.createBullet(this.selfSembo.type, this.distance, this.selfSembo.dimension, this.enemySembo.dimension);
    this.selfSembo.bullet = bullet;
    this.add(bullet);
    bullet.position.copy(this.selfSembo.position);

    // enemy bullet
    bullet = this.createBullet(this.enemySembo.type, -this.distance, this.enemySembo.dimension, this.selfSembo.dimension);
    this.enemySembo.bullet = bullet;
    this.add(bullet);
    bullet.position.copy(this.enemySembo.position);
  }

  private attack() {
    let bullet:Bullet = this.offensor.bullet;
    
    let self = this;
    bullet.actionFinish = () => {
      if (self.isPause) {
        self.pausePendingAction = self.switchAttackSide;
      }
      else {
        self.pausePendingAction = ()=>{};
        self.switchAttackSide();
      }
    }
    bullet.actionCollided = () => {
      self.semboHitten(self.defensor, self.offensor);
    }
    bullet.actionMissen = () => {
      self.semboDodge(self.defensor);
    }

    switch (this.nTurn % 6) {
      case 1:
      case 2:
      {
        bullet.isCritical = true;
        bullet.hitResult = "hit";
        break;
      }
      case 3:
      case 4:
      {
        bullet.isCritical = true;
        bullet.hitResult = "miss";
        break;
      }
      default:
      {
        bullet.isCritical = false;
        bullet.hitResult = "hit";
        break;
      }
    }

    bullet.charge();
    this.offensor.startAnim("hi");

    // hold back
    let chargeTime:number = 600;
    let zmove:number = 1;
    let yrot:number = -0.4;
    if (this.offensor == this.enemySembo) {
      zmove = -1;
    }
    let posVar:any = {z:this.offensor.position.z, ry:this.offensor.rotation.y};
    let posTo:any = {z:this.offensor.position.z + zmove, ry:this.offensor.rotation.y + yrot};
    let onUpdate = function () {
      self.offensor.position.z = posVar.z;
      self.offensor.rotation.y = posVar.ry;
    }
    let tween = new TWEEN.Tween(posVar).onUpdate(onUpdate).easing(TWEEN.Easing.Linear.None)
    .to(posTo, chargeTime).start();

    // dash forward
    let posVar2:any = {z:this.offensor.position.z + zmove, ry:this.offensor.rotation.y + yrot};
    let posTo2:any = {z:this.offensor.position.z, ry:this.offensor.rotation.y};
    let onUpdate2 = function () {
      self.offensor.position.z = posVar2.z;
      self.offensor.rotation.y = posVar2.ry;
    }
    let tween2 = new TWEEN.Tween(posVar2).onUpdate(onUpdate2).easing(TWEEN.Easing.Linear.None)
    .to(posTo2, 100).delay(chargeTime).start();
  }

  private semboHitten(sembo:Sembo, offensor:Sembo) {
    // calculat damage
    let damage = (offensor.atk - sembo.def) * 1;
    damage = Math.max(1, damage); // cannot < 1
    if (offensor.bullet.isCritical) {
      damage *= 1.6;
    }
    damage = Math.round(damage);
    sembo.hpRemain -= damage;
    sembo.hpRemain = Math.max(0, sembo.hpRemain);
    this.updateSemboStatus();

    let tilt:number = 0.2;
    if (sembo == this.enemySembo) tilt = -tilt;
    sembo.rotation.x = tilt;
    
    sembo.flushRed();

    // stand back
    if (sembo.hpRemain <= 0) {
      sembo.startAnim("die");
      return;
    }
    else {
      sembo.startAnim("pain");
    }
    let posVar:any = {x:sembo.rotation.x};
    let posTo:any = {x:0};
    let onUpdate = function () {
      sembo.rotation.x = posVar.x;
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo, 600)
    .delay(400)
    .start();
  }

  private semboDodge(sembo:Sembo) {
    let originX:number = sembo.position.x;
    let dodgeDist:number = 2;
    let posVar:any = {x:originX};
    let posTo:any = {x:originX + dodgeDist};
    let onUpdate = function () {
      sembo.position.x = posVar.x;
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo, 200)
    .start();

    let onUpdate2 = function () {
      sembo.position.x = posVar2.x;
    }
    let posVar2:any = {x:originX + dodgeDist};
    let posTo2:any = {x:originX};
    let tween2 = new TWEEN.Tween(posVar2)
    .onUpdate(onUpdate2)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo2, 600)
    .delay(400)
    .start();
  }

  private cameraSet() {
    let self = this;
    let posVar:any = {x:this.camera.position.x, z:this.camera.position.z};
    let posTo:any = {x:6, z:17};
    let onUpdate = function () {
      self.camera.position.x = posVar.x;
      self.camera.position.z = posVar.z;
      self.camera.lookAt(self.cameraLookAt);
    };
    let onFinish = function () {
      self.attack();
    };
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate).onComplete(onFinish).easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 1000).start();
  }

  private cameraZoom() {
    let self = this;
    let posVar:any = {x:this.camera.position.x, y:this.camera.position.y};
    let posTo:any = {x:2, y:this.camera.position.y + 1};
    let onUpdate = function () {
      self.camera.position.x = posVar.x;
      self.camera.position.y = posVar.y;
      self.camera.lookAt(self.cameraLookAt);
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate).easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 500).delay(300).start();

    // remove enemyHpBar
    this.remove(this.enemyHpBar);
    this.enemyHpBar = null;
    this.updateEnemyUI(null, this.camera);
  }

  private cameraEgg() {
    let self = this;
    let posVar:any = {
      x:self.camera.position.x, y:self.camera.position.y, z:self.camera.position.z, 
      cz:self.cameraLookAt.z, ez:self.enemySembo.position.z, sz:self.selfSembo.position.z, rz:self.ringEnemy.position.z};
    let posTo:any = {x:0, y:3, z:-5, cz:self.spinPivot.position.z, ez:-10, sz:10, rz:6};
    let onUpdate = function () {
      self.camera.position.set(posVar.x, posVar.y, posVar.z); 
      self.cameraLookAt.z = posVar.cz;
      self.camera.lookAt(self.cameraLookAt);
      self.enemySembo.position.z = posVar.ez;
      self.selfSembo.position.z = posVar.sz;
      self.ringEnemy.position.z = posVar.rz;
    }
    let onFinish = function () {
      self.eggRise();
      self.selfSembo.destroy();
      self.spinPivot.remove();
      self.enemySembo.destroy();
      self.spinPivot.remove();
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate).onComplete(onFinish).easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 500).start();
  }

  private eggRise() {
    let self = this;
    let posVar:any = {y:this.egg.position.y};
    let posTo:any = {y:this.egg.position.y + 2};
    let onUpdate = function () {
      self.egg.position.y = posVar.y;
    }
    let onFinish = function () {
      self.eggGetting = true;
      self.eggGetAction();
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate).onComplete(onFinish).easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 500).start();
  }

  public openEgg() {
    this.egg.open();
  }

  public jumpToMate() {
    let self = this;
    // move camera
    let posVar:any = {x:this.camera.position.x, y:this.camera.position.y};
    let posTo:any = {x:0, y:7};
    let onCamUpdate = function () {
      self.camera.position.x = posVar.x;
      self.camera.position.y = posVar.y;
      self.camera.lookAt(self.cameraLookAt);
    }
    let tweenCam = new TWEEN.Tween(posVar)
    .onUpdate(onCamUpdate).easing(TWEEN.Easing.Linear.None)
    .to(posTo, 500).start();
    
    // jump
    let timeSpan = 1000;
    let tVar = {t:0};
    let tTo = {t:1}; // time span
    let g = 70;
    let vy = g * tTo.t / 2; // vertical init v
    let vz = (this.distance - this.spinRadius) / tTo.t;
    let zStart = this.selfSembo.position.z;

    let onUpdate = function () {
      self.selfSembo.position.y = vy * tVar.t - g * tVar.t * tVar.t / 2;
      self.selfSembo.position.z = zStart - vz * tVar.t;
    }
    let onFinish = function () {
      let sy = self.selfSembo.position.y;
      self.remove(self.selfSembo);
      self.spinPivot.add(self.selfSembo);
      self.selfSembo.position.set(0, sy, self.spinRadius);

      sy = self.enemySembo.position.y;
      self.remove(self.enemySembo);
      self.spinPivot.add(self.enemySembo);
      self.enemySembo.position.set(0, sy, 0);
      self.enemyMoveBack();
    }
    let tween = new TWEEN.Tween(tVar)
    .onUpdate(onUpdate).onComplete(onFinish).easing(TWEEN.Easing.Linear.None)
    .to(tTo, timeSpan).delay(500).start();
  }

  private enemyMoveBack() {
    let self = this;
    let posVar:any = {z:this.enemySembo.position.z};
    let posTo:any = {z:-this.spinRadius};
    let onUpdate = function () {
      self.enemySembo.position.z = posVar.z;
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Linear.None)
    .to(posTo, 200)
    .start();

    setTimeout(() => {
      self.spawnEgg();
    }, 600);
  }

  private spawnEgg() {
    let self = this;
    let posVar:any = {y:this.spinPivot.rotation.y};
    let posTo:any = {y:Math.PI * 6.5};
    let onUpdate = function () {
      self.spinPivot.rotation.y = posVar.y;
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .to(posTo, 4000)
    .start();

    // light spark
    let ls = new LightSparkle();
    this.add(ls);
    ls.position.copy(this.spinPivot.position);
    ls.position.y += 1.5;
    ls.position.z += 1;

    // spawn egg
    let egg = new Egg(this, this.selfSemboId, this.enemySemboId);
    egg.spinFinish = () => {
      self.cameraEgg();
    }
    this.add(egg);
    egg.position.copy(this.spinPivot.position);
    egg.position.y += 0.8;
    egg.position.z -= 1.5;
    egg.eggOpened = () => {
      self.eggOpened();
    };
    this.egg = egg;
    setTimeout(() => {
      egg.start();
    }, 500);
  }

  public switchAttackSide() {
    if (this.selfSembo.hpRemain > 0 && this.enemySembo.hpRemain > 0) {
      this.nTurn ++;
      let tmp = this.offensor;
      this.offensor = this.defensor;
      this.defensor = tmp;
      this.attack();
    }
    else if (this.enemySembo.hpRemain == 0) {
      // win
      this.battleStatus = 1;
      this.cameraZoom();
      this.victoryAction();
    }
    else {
      // lose
      this.battleStatus = 2;
    }
  }

  pause() {
    this.isPause = true;
  }

  continue() {
    this.pausePendingAction();
    this.isPause = false;
  }

  animate() {
    if (this.animate != null) {
      this.nFrame++;
      requestAnimationFrame( this.animate );
      //this.controls.update();

      // tunnel anim
      let groupSize = 5;
      let ngroup = Math.floor(this.planeList.length / groupSize);
      for (let i = 0; i < this.planeList.length; i++) {
        let plane = this.planeList[i];

        if (this.eggGetting) {
          if (this.nFrame % ngroup == Math.floor(i/groupSize)) {
            plane.material.emissiveIntensity = 0.8;
            plane.material.color = new THREE.Color(0.6, 0.7, 1);
            plane.material.wireframe = false;
          }
          this.tunnelMovSpeed = Math.min(5, this.tunnelMovSpeed + 0.1);
        }
        else {
          plane.material.emissiveIntensity = plane.emisScala + 0.4 * Math.sin((this.nFrame - plane.emisPhase) / plane.emisPeriod * 2 * Math.PI);
        }
        
        plane.position.z += this.tunnelMovSpeed;
        if (plane.position.z > 0) {
          plane.position.z = -this.nPlane * this.planeGap;
        }
      }

      if (this.eggGetting) {
        this.tunnelRotSpeed = Math.min(0.02, this.tunnelRotSpeed + 0.001);
      } 
      this.tunnel.rotation.z += this.tunnelRotSpeed;
      if (this.ringSelf != undefined && this.ringEnemy != undefined) {
        this.ringSelf.rotation.y += 0.01;
        this.ringEnemy.rotation.y += 0.01;
      }

      // hp
      if (this.enemyHpBar != undefined) {
        this.enemyHpBar.lookAt(this.camera.position);
        this.updateEnemyUI(this.enemyHpBar, this.camera);
      }
    }
  }

  destroy() {
      super.destroy();
  }
}