import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'round-color-toggle',
  template: `
  <div class="round-color-toggle">
    <button #btn class="btnOff btnSame" (click)="onClick()"> </button>
  </div>
  `,
  styles: [`
    .btnSame {
      padding: 15px 15px;
      position: relative;
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
    }
    .btnOff {
      margin: 2px;
      border: 2px solid rgba(255,255,255,0.5);
    }
    .btnOn {
      margin: 0;
      border: 4px solid white;
      box-shadow: 0 0 10px rgba(255,255,255,1);
    }
  `]
})
export class RoundColorToggle implements OnInit {

  @ViewChild('btn') btn: ElementRef;
  @Input() routeTo:string;
  @Input() bcolor:string;

  constructor( ) {
  }

  turnOn() {
    this.btn.nativeElement.classList.remove('btnOff');
    this.btn.nativeElement.classList.add('btnOn');
  }

  turnOff() {
    this.btn.nativeElement.classList.remove('btnOn');
    this.btn.nativeElement.classList.add('btnOff');
  }

  onClick() {
      if (this.routeTo != undefined) {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: this.routeTo}));
      }
      this.turnOn();
  }

  ngOnInit() {
    this.btn.nativeElement.style.backgroundColor = this.bcolor;
  }
}