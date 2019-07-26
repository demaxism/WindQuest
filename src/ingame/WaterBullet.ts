import { Bullet } from './Bullet';
import * as THREE from '../assets/js/three';
declare var THREE:any;

export class WaterBullet extends Bullet {

  constructor(distance:number, offensorDim:any, defensorDim:any) {
    super(distance, offensorDim, defensorDim);

    this.flyNP = 1;
    // ball
    let geometry = new THREE.SphereBufferGeometry( 0.7, 16, 8 );
    let imgTex = new THREE.TextureLoader().load( "assets/imgs/pattern/water_tex4.jpg" );
    imgTex.wrapS = imgTex.wrapT = THREE.RepeatWrapping;
    imgTex.anisotropy = 16;
    let beta = 0.7;
    var mt = new THREE.MeshPhongMaterial( {
      map: imgTex,
      color: new THREE.Color(0xffffff),
      specular: new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 ),
      transparent: true,
      emissive: new THREE.Color(0x3377ff),
      emissiveIntensity: 0.3,
      reflectivity: 1,
      shininess: 100,
      opacity:0.75
    });
    this.ball = new THREE.Mesh( geometry, mt );
    this.add(this.ball);
    this.ball.visible = false;

    let tex = new THREE.TextureLoader().load( 'assets/imgs/pattern/water-bubble.png' );

    // particle
    this.startZ = -this.offensorDim.z / 2;
    this.particleSys = new THREE.GPUParticleSystem( { maxParticles: 2500, particleSpriteTex: tex } ); // maxParticles the particle system life time.
    this.add(this.particleSys);
    this.options = {
      position: new THREE.Vector3(0, this.offensorDim.y / 2, this.startZ),
      positionRandomness: .5,
      velocity: new THREE.Vector3(),
      velocityRandomness: .3,
      color: 0x77aaff,
      colorRandomness: .2,
      turbulence: .0,
      lifetime: 1,
      size: 30,
      sizeRandomness: 1
    };
    this.stopZ = -this.distance + this.defensorDim.z / 2;
    this.parabola_s = - this.offensorDim.z / 2 - this.stopZ;
    this.parabolaA = -4 * this.parabola_h / (this.parabola_s * this.parabola_s);
    this.parabolaB = 4 * this.parabola_h / this.parabola_s;
    this.linearA = (this.defensorDim.y - this.offensorDim.y) / (2 * this.parabola_s);
    this.linearB = this.offensorDim.y / 2;

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
      lifetime: 1.0,
      size: 40,
      sizeRandomness: 3
    };

    // charge
    this.chargeSys = new THREE.GPUParticleSystem( { maxParticles: 2500 } );
    this.chargeOpt = {
      position: new THREE.Vector3(),
      positionRandomness: .7,
      velocity: new THREE.Vector3(),
      velocityRandomness: 1.5, // particle speed
      color: 0x0055ff,
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
    this.ball.rotation.x -= 0.03;
  }

  destroy() {
    super.destroy();
  }
}