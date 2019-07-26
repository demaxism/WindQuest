export class FrameUpdate {

  private nFrame:number = 0;
  private callbackId:number;

  constructor(
    private span: number,
    private vFrom: Object,
    private vTo: Object,
    private update: Function,
    private finish: Function = null
  ) { 
    this.animate = this.animate.bind(this);
    this.animate();
  }

  animate() {
    this.nFrame++;
    if (this.animate != null) {
      let vNow = {};
      for(var index in this.vFrom) { 
        if (this.vFrom.hasOwnProperty(index)) {
            vNow[index] = this.vFrom[index] + (this.vTo[index] - this.vFrom[index]) * this.nFrame/this.span;
        }
      }
      //vNow = this.vFrom + (this.vTo - this.vFrom) * this.nFrame/this.span;
      if (this.nFrame < this.span) {
        // update
        if (this.update != null) {
          this.update(this.nFrame, vNow);
        }
        this.callbackId = requestAnimationFrame( this.animate );
      }
      else {
        // finish
        if (this.finish != null) {
          this.finish();
        }
        cancelAnimationFrame(this.callbackId);
        this.animate = null;
      }
    }
  }
}