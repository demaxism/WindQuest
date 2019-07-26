import { Bullet } from './Bullet';
import * as THREE from '../assets/js/three';
declare var THREE:any;

export class FireBullet extends Bullet {

  constructor(distance:number, offensorDim:any, defensorDim:any) {
    super(distance, offensorDim, defensorDim);

    this.flyNP = 10;
    // ball
    let geometry = new THREE.SphereBufferGeometry( 0.5, 16, 8 );
    let imgFire = new THREE.TextureLoader().load( "assets/imgs/pattern/lava.png" );
    imgFire.wrapS = imgFire.wrapT = THREE.RepeatWrapping;
    imgFire.anisotropy = 16;
    var mt2 = new THREE.MeshPhongMaterial( {
      map: imgFire,
      transparent: true,
      emissive: new THREE.Color(0xff762b),
      emissiveIntensity: 0.3,
    });
    this.ball = new THREE.Mesh( geometry, mt2 );
    this.add(this.ball);
    this.ball.visible = false;

    // particle
    this.startZ = -this.offensorDim.z / 2;
    this.particleSys = new THREE.GPUParticleSystem( { maxParticles: 2500 } ); // maxParticles the particle system life time.
    this.add(this.particleSys);
    this.options = {
      position: new THREE.Vector3(0, this.offensorDim.y / 2, this.startZ),
      positionRandomness: .5,
      velocity: new THREE.Vector3(),
      velocityRandomness: .3,
      color: 0xff8833,
      colorRandomness: .2,
      turbulence: .0,
      lifetime: 1,
      size: 8,
      sizeRandomness: 1
    };
    this.stopZ = -this.distance + this.defensorDim.z / 2;

    let tex = new THREE.TextureLoader().load( 'assets/imgs/pattern/star_flat.png' );

    // explode
    this.explode = new THREE.GPUParticleSystem( { maxParticles: 2500, particleSpriteTex: tex } );
    this.add(this.explode);
    this.explodeOpt = {
      position: new THREE.Vector3(),
      positionRandomness: .0,
      velocity: new THREE.Vector3(),
      velocityRandomness: 1,
      color: 0xff5500,
      colorRandomness: .2,
      turbulence: .0,
      lifetime: 0.7,
      size: 25,
      sizeRandomness: 3
    };

    // charge
    this.chargeSys = new THREE.GPUParticleSystem( { maxParticles: 2500 } );
    this.chargeOpt = {
      position: new THREE.Vector3(),
      positionRandomness: .7,
      velocity: new THREE.Vector3(),
      velocityRandomness: 1,
      color: 0xff5500,
      colorRandomness: .2,
      turbulence: 0,
      lifetime: 1.0,
      size: 25,
      sizeRandomness: 3
    };
  }

  chargeInit() {
    
  }

  ballOnCharge() {
    this.ball.rotation.y -= 0.2;
    let sc = Math.min(this.ball.scale.x + 0.02, 1);
    this.ball.scale.set(sc,sc,sc);
  }

  ballOnFly() {
    this.ball.rotation.x -= 0.3;
  }

  destroy() {
    super.destroy();
  }
}