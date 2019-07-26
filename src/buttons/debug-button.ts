import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'debug-button',
  template: `
  <div class="debug-button">
    <button #btn class="btn1" (click)="onClick()"> {{caption}} </button>
  </div>
  `,
  styles: [`
    .btn1 {
      padding: 5px 10px;
      position: relative;
      background-color: rgba(255, 255, 255, 0.4);
      border: 1px solid black;
      font-family: 'Verdana';
      color: black;
      font-weight: 200;
      font-size: 1em;
      cursor: pointer;
      overflow: hidden;
    }
    .btn1:active {
      background-color: rgba(255, 255, 255, 1);
    }
  `]
})
export class DebugButton implements OnInit {

  @ViewChild('btn') btn: ElementRef;
  @Input() caption:string;
  @Input() routeTo:string;
  @Input() scaleTo:number;

  constructor( ) {
  }

  onClick() {
      if (this.routeTo != undefined) {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: this.routeTo}));
      }
  }

  ngOnInit() {
    if (this.scaleTo != undefined) {
      let scaleStr = "scale(" + this.scaleTo + ", " + this.scaleTo + ")";
      this.btn.nativeElement.style.transform = scaleStr;
    }
  }
}