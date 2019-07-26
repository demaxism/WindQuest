import * as THREE from '../assets/js/three';
declare var THREE:any;

export class Egg extends  (THREE.Group as { new(): any; }) {

  protected egg:THREE.Object3D;
  protected pivot:THREE.Object3D;
  protected sc:number = 0;
  protected rotSpeed:number = 0.1;
  protected doBreak:boolean = false;
  protected doSqueeze:boolean = false;
  protected squeezeTick:number = 0;
  protected nFrame:number = 0;
  protected frameOpenAnim:number = -1;
  protected caller:any;
  protected semboId1:string;
  protected semboId2:string;
  public spinFinish:Function;
  public eggOpened:Function;

  constructor(caller:any, semboId1:string, semboId2:string) {
    super();

    let self = this;
    this.caller = caller;
    this.semboId1 = semboId1;
    this.semboId2 = semboId2;
    this.pivot = new THREE.Object3D();
    this.add(this.pivot);

    let loader = new THREE.FBXLoader();
    loader.load('assets/ui3d/egg.fbx', function (object) { 
      object.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      object.position.set(0, 0, 0);
      self.pivot.add(object);
      self.egg = object;
      self.egg.rotation.x = 0.1;
      self.egg.scale.set(self.sc, self.sc, self.sc);
      // material
      let mat = self.egg.children[0].material;
      mat.opacity = 0;
      mat.transparent = true;
    });
  }

  start() {
    this.animate = this.animate.bind(this);
    this.animate();
  }

  open() {
    // start squeeze before open
    this.doSqueeze = true;
  }

  openAnim() {

  }

  animate() {
    if (this.animate != null) {
      requestAnimationFrame( this.animate );

      if (this.egg == null) return;
      if (this.nFrame > 5 * 60) {
        this.rotSpeed = Math.max(0.01, this.rotSpeed - 0.005);
        this.egg.rotation.x = Math.max(0, this.egg.rotation.x - 0.01);
      }

      if (this.nFrame == 5.5 * 60) {
        this.spinFinish(); // BattleView cameraEgg()
      }

      if (this.doSqueeze) {
        let delta:number = 0.1 * Math.sin(this.squeezeTick);
        this.squeezeTick += (Math.PI / 10);
        this.egg.scale.y = 1 + delta;
        this.egg.scale.x = 1 - delta;
        this.egg.scale.z = 1 - delta;

        if (this.squeezeTick >= Math.PI * 6) {
          this.doSqueeze = false;
          this.frameOpenAnim = this.nFrame + 20;
          this.openAnim();
        }
      }

      if (this.nFrame >= this.frameOpenAnim && this.frameOpenAnim != -1) {
        this.egg.children[0].position.y -= 0.2;
        this.egg.children[1].position.y += 0.2;

        if (this.nFrame == this.frameOpenAnim) {
          this.eggOpened();
        }
      }

      this.pivot.rotation.y += this.rotSpeed;
      this.sc += 0.006;
      if (this.sc >= 1) {
        this.sc = 1;
      }
      else {
        this.egg.scale.set(this.sc, this.sc, this.sc);
        this.egg.children[0].material.opacity = this.sc;
      }
      this.nFrame++;
    }
  }

  destroy() {
    cancelAnimationFrame(this.id);
    this.animate = null;
    this.pivot.remove(this.egg);
    this.egg = null;
  }
}