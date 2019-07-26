import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Common } from '../utils/Common';

@Component({
  selector: 'fade-mask',
  template: `
  <div #fadeMaskCont id="fadeMaskCont" class="full-size">

  </div>
  `,
  styles: [`
  #fadeMaskCont {
    z-index: 1300;
  }
  `]
})

export class FadeMask {

  private hashName:string;

  @ViewChild('fadeMaskCont') fadeMaskCont: ElementRef;
  constructor( ) {
    this.hashName = Common.makeHashId();
  }

  fadeInMask() {
    this.fadeMaskCont.nativeElement.style.display = "block";
    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          let id = j * 5 + i;
          $('#block_' + this.hashName + id).removeClass('aniOut');
          $('#block_' + this.hashName + id).addClass('aniIn');
        }, (i + j) * 70);
      }
    }
  }

  fadeOutMask() {
    for (let j = 0; j < 10; j++) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          let id = j * 5 + i;
          $('#block_' + this.hashName + id).addClass('aniOut');
        }, (i + j) * 70);
      }
    }
    setTimeout(() => {
      this.fadeMaskCont.nativeElement.style.display = "none";
    }, 1200)
  }

  ngAfterViewInit() {
    for (let i = 0; i < 50; i++) {
      this.fadeMaskCont.nativeElement.insertAdjacentHTML('beforeend','<div class="maskSubBlock" id="block_' + this.hashName + i + '"></div>');
    }
  }
}