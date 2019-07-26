import * as THREE from '../assets/js/three';
declare var THREE:any;

export class LightSparkle extends  (THREE.Group as { new(): any; }) {

  protected particleSys:THREE.GPUParticleSystem;
  protected options:any;
  protected tick:number = 0;
  protected timeDelta:number = 0.016;
  protected nPartPerFrame:number = 0; // n particle per frame to spawn
  protected partIncrSpeed:number = 0.04; // nPartPerSec increment per frame
  protected maxPartPerFrame:number = 8;
  // 从n帧生成一个到一帧生成m个
  protected counter:number = 0;

  constructor() {
    super();

    let tex = new THREE.TextureLoader().load( 'assets/imgs/pattern/sparkle.png' );
    this.options = {
      position: new THREE.Vector3(0, 0, 0),
      positionRandomness: 3,
      velocity: new THREE.Vector3(),
      velocityRandomness: .3,
      color: 0x6688ff,
      colorRandomness: .5,
      turbulence: .0,
      lifetime: 0.6,
      size: 58,
      sizeRandomness: 1
    };
    this.particleSys = new THREE.GPUParticleSystem( { maxParticles: 2500, particleSpriteTex: tex } );
    this.add(this.particleSys);

    this.animate = this.animate.bind(this);
    this.animate();

    setTimeout(() => {
      this.fade();
    }, 4000);
  }

  fade() {
    this.partIncrSpeed = -0.08;
  }

  animate() {
    if (this.animate != null) {
      requestAnimationFrame( this.animate );
      if (this.particleSys == null) return;

      this.tick += this.timeDelta;
      this.nPartPerFrame = Math.min(this.maxPartPerFrame, this.nPartPerFrame + this.partIncrSpeed);
      this.counter += this.nPartPerFrame;

      if (this.counter >= 1) {

        for (let i = 0; i < this.counter; i++) {
          this.particleSys.spawnParticle( this.options );
        }
        this.counter = 0;
      }
      this.particleSys.update(this.tick);
    }
  }

  destroy() {
    cancelAnimationFrame(this.id);
    this.animate = null;

    this.particleSys.dispose();
    this.remove(this.particleSys);
    this.particleSys = null;
  }
}