import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'place-choose-toggle',
  template: `
  <div class="place-choose-toggle">
    <button #btn class="btnOff btnSame" (click)="onClick()">
      <img src="assets/imgs/buttons/{{bicon}}.png" width=40 height=40 />
    </button>
  </div>
  `,
  styles: [`
    .btnSame {
      padding: 1px 5px;
      position: relative;
      cursor: pointer;
      overflow: hidden;
    }
    .btnSame:active {
      margin: 0;
      border-radius: 20%;
      border: 1px solid white;
      box-shadow: 0 0 10px rgba(255,255,255,1);
    }
    .btnOff {
      background-color: rgba(0,0,0,0);
      margin: 1px;
    }
    .btnOn {
      margin: 0;
      border: 1px solid white;
      background-color: rgba(0,0,0,0.3);
      border-radius: 20%;
    }
  `]
})
export class PlaceChooseToggle implements OnInit {

  @ViewChild('btn') btn: ElementRef;
  @Input() bicon:string;
  @Input() isActive:boolean;
  @Input() routeTo:string;

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
    if (!this.isActive) this.turnOn();
  }

  ngOnInit() {
    if (this.isActive) this.turnOn();
    else this.turnOff();
  }
}