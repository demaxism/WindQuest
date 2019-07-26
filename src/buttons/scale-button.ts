import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'scale-button',
  template: `
  <div class="icon-toggle">
    <button #btn class="btn1" (click)="onClick()">
      <img src="assets/imgs/buttons/{{bicon}}.png" width={{size}} />
    </button>
  </div>
  `,
  styles: [`
    .btn1 {
      padding: 5px;
      background-color: transparent;
      transform:scale(1);
      transition: 0.1s ease-out;
    }
    .btn1:active {
      transform:scale(1.2);
      transition: 0.1s ease-out;
    }
    .btn1 img {
      height: auto;
    }
  `]
})
export class ScaleButton implements OnInit {

  @ViewChild('btn') btn: ElementRef;
  @Input() bicon:string;
  @Input() routeTo:string;
  @Input() size:number;
  @Output() clickDelayed : EventEmitter<any> = new EventEmitter<any>();

  constructor( ) {
  }

  onClick() {
    this.btn.nativeElement.style.pointerEvents = "none";
    let self = this;
    setTimeout(()=> {
      self.doRoute();
      self.clickDelayed.emit();
      self.btn.nativeElement.style.pointerEvents = "auto";
    }, 200)
  }

  doRoute() {
    if (this.routeTo != undefined) {
      window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: this.routeTo}));
    }
  }

  ngOnInit() {
    
  }
}