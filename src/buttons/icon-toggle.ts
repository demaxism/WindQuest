import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'icon-toggle',
  template: `
  <div class="icon-toggle">
    <button #btn class="btnOff btnSame" (click)="onClick()">
      <img src="assets/imgs/buttons/init_pet_{{index}}.png" width={{size}} height={{size}} />
    </button>
  </div>
  `,
  styles: [`
    .btnSame {
      padding: 5px 5px;
      position: relative;
      background-color: transparent;
      border: 2px solid white;
      border-radius: 10px;
      cursor: pointer;
      overflow: hidden;
    }
    .btnOff {
      margin: 2px;
      opacity: 0.7;
      border: 2px solid rgba(255,255,255,0.5);
    }
    .btnOn {
      margin: 0;
      opacity: 1.0;
      border: 4px solid white;
      box-shadow: 0 0 10px rgba(255,255,255,1);
    }
  `]
})
export class IconToggle implements OnInit {

  @ViewChild('btn') btn: ElementRef;
  @Input() index:number;
  @Input() size:number;
  @Input() filterId:string; // for identified by parent

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
      this.turnOn();
  }

  ngOnInit() {
    
  }
}