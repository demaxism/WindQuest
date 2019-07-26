import * as THREE from '../assets/js/three';
declare var THREE:any;

export class PercentSlot extends  (THREE.Group as { new(): any; }) {

  private bar:THREE.Mesh;
  private p_width:number = 5;
  private p_height:number = 0.6;

  constructor() {
    super();

    let width = this.p_width;
    let height = this.p_height;
    let pl = new THREE.PlaneBufferGeometry( width + 0.1, height + 0.1 );
    let material = new THREE.MeshBasicMaterial({ color: 0x004d99, side: THREE.DoubleSide });
    let slot = new THREE.Mesh(pl, material);
    this.add(slot);

    let materialBar = new THREE.MeshBasicMaterial({ color: 0xffbf80, side: THREE.DoubleSide });

    let plFrame = new THREE.PlaneBufferGeometry( width + 0.2, height + 0.2 );
    let frame = new THREE.Mesh(plFrame, materialBar);
    frame.position.z = -0.001;
    this.add(frame);

    let plBar = new THREE.PlaneBufferGeometry( width, height );
    this.bar = new THREE.Mesh(plBar, materialBar);
    this.bar.position.z = 0.001;
    this.add(this.bar);
  }

  updatePercent(percent) {
    this.bar.scale.x = percent;
    this.bar.position.x = -(1 - percent) / 2 * this.p_width;
  }
}