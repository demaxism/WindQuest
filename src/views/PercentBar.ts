import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'PercentBar',
  template: `
  <div #cont class="PercentBar">
    <div class="progress progress-striped">
      <div #progressBar class="progress-bar">
      </div>                       
    </div> 
  </div>
  `,
  styles: [`
    .PercentBar {
      height: 100%;
    }

    .progress {
      height: 100%;
      padding: 3px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
    }
    
    .progress-bar {	
      height: 100%;
      background-color: #ee303c;  
      border-radius: 2px; 
      transition: 0.4s linear;  
      transition-property: width, background-color;    
    }
    
    .progress-striped .progress-bar { 	
      background-color: #FCBC51; 
      width: 70%; 
    }
  `]
})
export class PercentBar implements OnInit {

  @ViewChild('cont') cont: ElementRef;
  @ViewChild('progressBar') progressBar: ElementRef;
  @Input() caption:string;
  @Input() routeTo:string;
  @Input() scaleTo:number;

  constructor( ) {
  }

  onClick() {

  }

  hide() {
    this.cont.nativeElement.style.display = "none";
  }

  updatePercentage(p:number) {
    this.progressBar.nativeElement.style.width = (p * 100) + "%";
  }

  ngAfterViewInit() {

  }

  ngOnInit() {
    
  }
}