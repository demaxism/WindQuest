import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var Util:any;

@Component({
  selector: 'JumpText',
  template: `
  <div #cont id="cont" class="JumpText">
    <h1>
      <span class="jumpTitle">{{title}}</span>
    </h1> 
  </div>
  `,
  styles: [`
    @import url(https://fonts.googleapis.com/css?family=Fjalla+One);
    #cont {
      display: none;
    }

    .JumpText {
      height: 100%;
      font-family: 'Fjalla One', sans-serif;
    }

    .JumpText h1{
      text-transform: uppercase;
      font-size: 42px;
      margin: 0;
      line-height: 47px;
      letter-spacing: 2px;
    }

    .jumpTitle {
      transform: rotate(-10deg);
      display: block;
      float: left;
      color: #f1c83c;
      position: relative;
    }
  `]
})
export class JumpText implements OnInit {

  @Input() title:string;
  @ViewChild('cont') cont: ElementRef;
  constructor( ) {
  }

  start() {
    this.cont.nativeElement.style.display = "block";
    setTimeout(() => {
      Util.jumpTextAnimate();
    }, 600);
  }

  close() {
    Util.jumpTextAnimateOut();
    setTimeout(()=>{
      let el = this.cont.nativeElement;
      el.style.display = "none";
      // remove innerHTML content
      while (el.firstChild) el.removeChild(el.firstChild);
    }, 800);
  }

  ngAfterViewInit() {
    Util.jumpTextInit();
  }

  ngOnInit() {
    
  }
}