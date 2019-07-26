import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener, QueryList, ViewChildren } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { SailView } from '../../views/SailView';
import * as THREE from '../../assets/js/three';
import * as Stats from '../../assets/js/libs/stats.min.js';
import * as TWEEN from '../../assets/js/tween.min.js';
import { FadeMask } from '../../views/FadeMask';
import { FrameUpdate } from '../../utils/FrameUpdate';
declare var TWEEN:any;
declare var eventHub:THREE.Object3D;
eventHub = new THREE.Object3D();
declare var CFG:any;

@Component({
  selector: 'sail-page',
  template: `
    <div #container id="container"></div>
    <div class="skyCover"></div>
    <debug-button class="top-pad-1" caption="home" routeTo="HomePage"></debug-button>
    <div #contCommand id="contCommand">
      <button-common class="btn-h1 btnL1" *ngIf="showEnter" caption="ENTER" (click)="onEnter()"></button-common>
      <button-common class="btn-h1 btnL1" *ngIf="showAttack" caption="ATTACK" (click)="onEnter()"></button-common>
      <button-common class="btn-h1" id="btn-skip" caption="SKIP" (click)="onSkip()"></button-common>
    </div>
    <fade-mask #fadeMask></fade-mask>
  `,
  styles: [`
  .skyCover {
    background-image: linear-gradient(rgba(45, 106, 230, 1),rgba(45, 106, 230, 0));
    position: absolute;
    width: 100%;
    height: 40%;
    top: 0px;
    z-index: 100;
  }
  #container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(155,200,250,0.7);
    z-index: -1;
  }
  #contCommand {
    position: absolute;
    display: none;
    width: 100%;
    height: 200px;
    bottom: 0px;
    background-image: url("assets/imgs/pattern/dark_up_fade.png");
    background-repeat: repeat-x;
    background-size: 10px 100%;
    display:none;
    z-index: 200;
  }
  .btn-h1 {
    position: absolute;
    left:50%;
    transform: translate(-50%, -50%);
  }
  .btnL1 {
    bottom: 110px;
  }
  
  #btn-skip {
    bottom: 40px;
  }
  `]
})
/**
 * This is the scene when user enter the app, show his first place with sembo
 *
 */
export class SailPage {

  private renderer: THREE.WebGLRenderer;
  private stats: Stats;
  public scene: SailView;
  private inactive: boolean = false;
  private showEnter:boolean = false;
  private showAttack:boolean = false;

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  @ViewChild('container') containerRef: ElementRef;
  @ViewChild('contCommand') contCommand: ElementRef;
  @ViewChild('fadeMask') maskCover: FadeMask;

  constructor(
    private userService:UserService,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {

  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  animate() {
    if (this.inactive) return;

    requestAnimationFrame( this.animate );

    this.renderer.render( this.scene, this.scene.camera );

    this.stats.update();
    TWEEN.update();
    eventHub.dispatchEvent({type:"onFrame"});
  }

  private createScene() {
    // 3D
    let container: HTMLElement = this.containerRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    // set preserveDrawingBuffer to true to enable canvas image save
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( container.clientWidth, container.clientHeight );
    this.renderer.shadowMap.enabled = true;
    container.appendChild( this.renderer.domElement );
    this.renderer.domElement.setAttribute("id", "canvas3d");

    this.stats = new Stats();
    container.appendChild( this.stats.dom );
    this.stats.dom.style.top = "100px";

    this.scene = new SailView(container, this.renderer, this, this.userService);
    this.scene.stopOnTarget = this.showCommand;
    this.scene.sceneLoaded = this.onSceneLoaded;
    this.scene.enterFinish = this.onEnterFinish;
    this.animate = this.animate.bind(this);
    this.animate();
  }

  showCommand(self, isStopEnemy:boolean) {
    self.showAttack = isStopEnemy;
    self.showEnter = !isStopEnemy;
    self.contCommand.nativeElement.style.display = "block";
  }

  hideCommand() {
    this.contCommand.nativeElement.style.display = "none";
  }

  onSceneLoaded(self:SailPage) {
    new FrameUpdate(10, {x:1}, {x:0}, (nFrame, vNow)=> { }, ()=> {
      self.maskCover.fadeOutMask();
    })
  }

  onEnterFinish(self:SailPage) {
    self.maskCover.fadeInMask();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW_NOANIM", {detail: "VisitPage"}));
    }, 1000);
  }

  onEnter() {
    this.hideCommand();
    this.scene.enterPlace();
  }

  onSkip() {
    this.hideCommand();
    this.scene.continueSail();
  }

  /* LIFECYCLE */
  ngAfterViewInit() {
    this.createScene();
  }

  ngOnDestroy() {
    this.inactive = true;
    this.scene.destroy();
  }

}
