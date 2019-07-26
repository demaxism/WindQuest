import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener, QueryList, ViewChildren } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { ViewBase } from '../../views/ViewBase';
import { PlaceView } from '../../views/PlaceView';
import * as THREE from '../../assets/js/three';
import * as Stats from '../../assets/js/libs/stats.min.js';
import * as TWEEN from '../../assets/js/tween.min.js';
import { PlaceChooseToggle } from '../../buttons/place-choose-toggle';
import { FrameUpdate } from '../../utils/FrameUpdate';
import { AuthUserService } from '../../auth/_services';
declare var TWEEN:any;
declare var eventHub:THREE.Object3D;
eventHub = new THREE.Object3D();
declare var CFG:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
/**
 * This is the scene when user enter the app, show his first place with sembo
 *
 */
export class HomePage {

    private renderer: THREE.WebGLRenderer;
    private stats: Stats;
    public scene: PlaceView;
    private placeViewList:Array<PlaceView> = [];
    private nPlaceViewLoaded:number = 0;
    private initLoading:boolean = true;
    private loading:boolean = false;
    private inactive: boolean = false;
    private placeDispList:Array<any> = [];

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    @ViewChild('container') containerRef: ElementRef;
    @ViewChild('maskCover') maskCover: ElementRef;
    @ViewChild('blocker') blocker: ElementRef;
    @ViewChildren(PlaceChooseToggle) placeTogs : QueryList<PlaceChooseToggle>;

    constructor(
        private userService:UserService,
        private authUserService: AuthUserService,
        public navCtrl: NavController,
        public viewCtrl: ViewController
    ) {
        this.blockOff = this.blockOff.bind(this);
        this.scFadeOutFinish = this.scFadeOutFinish.bind(this);
        this.activePlaceLoadFinish = this.activePlaceLoadFinish.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    animate() {
        if (this.inactive) return;

        requestAnimationFrame( this.animate );
    
        if (this.scene != undefined) {
            this.renderer.render( this.scene, this.scene.camera );
        }

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

        let currentSemboId = this.userService.activeSemboId;
        let placeName = this.userService.activeLandId;
        if (placeName == "default") placeName = "land_A01";
        let activeSc = new PlaceView(container, currentSemboId, placeName, this.userService);
        activeSc.fadeFinish = this.blockOff;
        activeSc.fadeOutFinish = this.scFadeOutFinish;
        activeSc.loadFinish = this.activePlaceLoadFinish;
        activeSc.isActive = true;
        this.scene = activeSc;

        this.animate = this.animate.bind(this);
        this.animate();
    }

    ionViewWillEnter() {
        // when sembo-list view pops, the switchViewCover should hide
    }

    ionViewDidLeave() {
        // when sembo-list view pushes
    }

    blockOn() {
        this.blocker.nativeElement.style.pointerEvents = "fill";
    }

    blockOff() {
        this.blocker.nativeElement.style.pointerEvents = "none";
    }

    activePlaceLoadFinish() {
        this.nPlaceViewLoaded++;

        let self = this;
        new FrameUpdate(5, {x:0.5}, {x:0}, (nFrame, vNow)=> {
            self.maskCover.nativeElement.style.opacity = vNow.x;
        }, ()=> {
            self.initLoading = false;
        })

        let container: HTMLElement = this.containerRef.nativeElement;
        for (let i = 0; i < this.userService.currentUser.places.length; i++) {
            if (i == this.userService.activePlace) {
                this.placeViewList.push(this.scene);
                continue;
            }

            let currentPlaceData = this.userService.currentUser.places[i];
            let placeName = Object.keys(currentPlaceData)[0];
            let placeSemboId = currentPlaceData[placeName];
            if (placeName == "default") placeName = "land_A01";
            let sc = new PlaceView(container, placeSemboId, placeName, this.userService);
            sc.fadeFinish = this.blockOff;
            sc.fadeOutFinish = this.scFadeOutFinish;
            sc.loadFinish = () => {};
            sc.hide();
            this.placeViewList.push(sc);
        }
    }

    scFadeOutFinish() {
        this.scene = this.placeViewList[this.userService.activePlace];
        this.scene.fadeIn();
    }

    onBtnAbout() {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "EntryPage"})); 
    }

    onBtnSembos() {
        this.loading = true;
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "SemboListPage"}));
        //window.dispatchEvent(new CustomEvent("EVT_PUSH_VIEW", {detail: "SemboListPage"}));
    }

    onBtnSail() {
        this.loading = true;
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "SailPage"}));
    }

    choosePlace(index:number) {
        if (this.userService.activePlace != index) {
            this.userService.activePlace = index;

            for (let i = 0; i < this.placeDispList.length; i++) {
                let pd = this.placeDispList[i];
                if (i != index) {
                    let placeTog:PlaceChooseToggle = this.placeTogs.toArray()[i];
                    placeTog.turnOff();
                    pd.isActive = false;
                }
            }
            this.blockOn();
            this.scene.fadeOut();
        }
    }

    initPlaceDispList() {
        for (let i = 0; i < this.userService.currentUser.places.length; i++) {
            let element = this.userService.currentUser.places[i];
            let isActive = (i == this.userService.activePlace);
            let placeName = Object.keys(element)[0];
            let placeSemboId = element[placeName];
            let icon = "place_icon_empty";
            if (placeSemboId.length > 1) icon = "place_icon_within";
            this.placeDispList.push({isActive:isActive, icon:icon, index:i});
        }
    }

    updatePlaceTogs() {
        this.placeDispList = [];
        this.initPlaceDispList();

        for (let i = 0; i < this.placeDispList.length; i++) {
            let pd = this.placeDispList[i];
            let placeTog:PlaceChooseToggle = this.placeTogs.toArray()[i];
            placeTog.isActive = pd.isActive;
            placeTog.bicon = pd.icon;
            placeTog.ngOnInit();
        }
    }
 
    /* LIFECYCLE */
    ngAfterViewInit() {
        let self = this;
        let labelDbg: HTMLElement = document.getElementById( 'label-dbg' );
        labelDbg.innerHTML = "w:" + $(window).width();

        this.initPlaceDispList();

        this.createScene();
    }

    ngOnDestroy() {
        this.inactive = true;
        if (this.containerRef.nativeElement != null) {
            this.containerRef.nativeElement.innerHTML = "";
        }
        for (let i = 0; i < this.placeViewList.length; i++) {
            let sc = this.placeViewList[i];
            if (sc != null) {
                sc.destroy();
                sc = null;
            }
        }
    }

}
