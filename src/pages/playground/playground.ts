import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import * as THREE from '../../assets/js/three';
import * as Stats from '../../assets/js/libs/stats.min.js';
import * as TWEEN from '../../assets/js/tween.min.js';
declare var TWEEN:any;
import { UserService } from '../../providers/user-service';
import { TestFace } from '../../views/TestFace';
import * as MainScene from '../../assets/class/MainScene';
declare var MainScene:any;
import * as DemoView from '../../assets/class/DemoView';
declare var DemoView:any;
declare var eventHub:THREE.Object3D;
eventHub = new THREE.Object3D();
declare var CFG:any;

@Component({
  selector: 'playground',
  templateUrl: 'playground.html'
})
export class Playground {

    private renderer: THREE.WebGLRenderer;
    private stats: Stats;
    public scene: THREE.Scene;
    
    private rendererDemo: THREE.WebGLRenderer;
    private demoView: THREE.Scene;
    private inactive: boolean = false;

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    @ViewChild('container') containerRef: ElementRef;
    @ViewChild('demoBox') demoBoxRef: ElementRef;
    @ViewChild('normalLayer') normalLayer: ElementRef;
    @ViewChild('demoLayer') demoLayer: ElementRef;
    @ViewChild('btnBreed') btnBreed: ElementRef;
    @ViewChild('btnClear') btnClear: ElementRef;

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
    
        this.stats.update();
        TWEEN.update();
        eventHub.dispatchEvent({type:"onFrame"});
    }

    private createScene() {
        // Initialize Phaser
        // this.mainUI = new MainUI(this.userService);

        // 3D
        let container: HTMLElement = this.containerRef.nativeElement;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        // set preserveDrawingBuffer to true to enable canvas image save
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( container.clientWidth, container.clientHeight );
        this.renderer.shadowMap.enabled = true;
        container.appendChild( this.renderer.domElement );
        this.renderer.domElement.setAttribute("id", "canvas3d");

        this.stats = new Stats();
        container.appendChild( this.stats.dom );
        this.stats.dom.style.top = "200px";

        //this.scene = new MainScene(container, this.userService, this.renderer);
        //this.scene = new TestMapView(container, this.userService, this.renderer);
        this.scene = new TestFace(container, this.userService, this.renderer);
        this.animate = this.animate.bind(this);
        this.animate();
    }

    private createDemoBox() {
        // 3D
        let container: HTMLElement = this.demoBoxRef.nativeElement;
        this.rendererDemo = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
        // set preserveDrawingBuffer to true to enable canvas image save
        this.rendererDemo.setPixelRatio( window.devicePixelRatio );
        this.rendererDemo.setSize( container.clientWidth, container.clientHeight );
        container.appendChild( this.rendererDemo.domElement );
        this.rendererDemo.domElement.setAttribute("id", "demoBox3d");
        container.style.display = "none";

        this.demoView = new DemoView(container, this.rendererDemo, this.userService);
        this.demoLayer.nativeElement.style.display = "none";
    }

    onBtnAbout() {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "EntryPage"})); 
    }

    onBtnList() {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "SemboListPage"}));
    }

    onBtnBreed() {
        //this.btnBreed.nativeElement.style.display = "none";
        eventHub.dispatchEvent({type:"EVT_BREED"});
    }

    onBtnClear() {
        eventHub.dispatchEvent({type:"EVT_REMOVE_LAST", data:1234});
    }

    onBtnDiscard() {
        eventHub.dispatchEvent({type:"EVT_BtnDemoDiscard"}); 
    }

    onBtnSave() {
        eventHub.dispatchEvent({type:"EVT_BtnDemoSave"}); 
    }

    toDemoView() {
        this.normalLayer.nativeElement.style.display = "none";
    }

    toNormalView() {
        this.normalLayer.nativeElement.style.display = "block";
        this.demoLayer.nativeElement.style.display = "none";
        this.btnBreed.nativeElement.style.display = "block";
    }

    private on_EVT_DEMO_SEMBO:Function;
    private on_EVT_DISCARD_BREED:Function;
    private on_EVT_ADD_BREED:Function;
    private on_EVT_DEMO_SEMBO_LOADED:Function;

    /* LIFECYCLE */
    ngAfterViewInit() {
        let self = this;
        let labelDbg: HTMLElement = document.getElementById( 'label-dbg' );
        labelDbg.innerHTML = "w:" + $(window).width();

        this.createScene();
        this.createDemoBox();

        this.on_EVT_DEMO_SEMBO = function(event) {
            self.toDemoView();
        }
        eventHub.addEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);
        this.on_EVT_DISCARD_BREED = function(event) {
            self.toNormalView();
        }
        eventHub.addEventListener("EVT_DISCARD_BREED", this.on_EVT_DISCARD_BREED);
        this.on_EVT_ADD_BREED = function(event) {
            self.toNormalView();
        }
        eventHub.addEventListener("EVT_ADD_BREED", this.on_EVT_ADD_BREED);
        this.on_EVT_DEMO_SEMBO_LOADED = function(event) {
            self.demoLayer.nativeElement.style.display = "block";
        }
        eventHub.addEventListener("EVT_DEMO_SEMBO_LOADED", this.on_EVT_DEMO_SEMBO_LOADED);
    }

    ngOnDestroy() {
        eventHub.removeEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);
        eventHub.removeEventListener("EVT_DISCARD_BREED", this.on_EVT_DISCARD_BREED);
        eventHub.removeEventListener("EVT_ADD_BREED", this.on_EVT_ADD_BREED);
        eventHub.removeEventListener("EVT_DEMO_SEMBO_LOADED", this.on_EVT_DEMO_SEMBO_LOADED);

        this.inactive = true;
        this.scene.destroy();
        this.demoView.destroy();
        this.demoView = null;
    }

}
