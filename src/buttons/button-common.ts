import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'button-common',
  template: `
  <div class="button-common">
    <button #btn class="btn1" (click)="onClick()"> {{caption}} </button>
  </div>
  `,
  styles: [`
    .btn1 {
      padding: 10px 20px;
      position: relative;
      background-color: rgba(255, 255, 255, 0.1);
      border: 2px solid white;
      border-radius: 50px;
      font-family: 'Verdana';
      color: white;
      font-weight: 400;
      font-size: 1.2em;
      cursor: pointer;
      overflow: hidden;
    }
    .btn1:active {
      background-color: rgba(255, 255, 255, 0.7);
      transition: background-color 0.4s ease-out;
      color: rgb(102, 102, 153);
      transition: color 0.4s ease-out;
      border-color: rgb(102, 102, 153);
      transition: border-color 0.4s ease-out;
      box-shadow: 0 0 10px rgba(255,255,255,1);
    }
  `]
})
export class ButtonCommon implements OnInit {

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