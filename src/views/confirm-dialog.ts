import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DialogControl } from '../views/DialogControl';

@Component({
  selector: 'confirm-dialog',
  template: `
  <div #cont class="blocker semiMask" style="display:none">
    <div class="vertMid dialogBack">
        <h1 class="h1Center">
          <ng-content></ng-content>
        </h1>
        <br>
        <div class="btnLine">
            <button-common class="btn-line" caption="<" (click)="hide()" ></button-common>
            <button-common class="btn-line" caption="OK" (click)="onOk()" ></button-common>
        </div>
    </div>
  </div>
  `,
  styles: [`
  .dialogBack {
      padding: 10px 6px;
      margin: 5%;
      width: 90%;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 16px;
      background-color: rgba(0,0,0,0.5);
  }
  `]
})

export class ConfirmDialog {

  @Input() control:DialogControl;
  @ViewChild('cont') cont:ElementRef;

  constructor( ) {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.cont.nativeElement.style.display = "block";
  }

  hide() {
    this.cont.nativeElement.style.display = "none";
    this.control.cancelAction = this.control.cancelAction.bind(this.control.parent);
    this.control.cancelAction();
  }

  onOk() {
    this.control.okAction = this.control.okAction.bind(this.control.parent);
    this.control.okAction();
    this.hide();
  }
 
  ionViewWillEnter() {
    
  }

  ngAfterViewInit() {
    if (this.control != undefined) {
      this.control.show = this.show;
      this.control.hide = this.hide;
    }
  }
}