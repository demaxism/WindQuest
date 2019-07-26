import { AfterViewInit, Component, ElementRef, Input, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { NavController, ViewController, Icon } from 'ionic-angular';
import * as THREE from '../../assets/js/three';
import * as Stats from '../../assets/js/libs/stats.min.js';
import * as TWEEN from '../../assets/js/tween.min.js';
declare var TWEEN:any;
import { UserService } from '../../providers/user-service';
import { StarterView } from '../../views/StarterView';
import { RoundColorToggle } from '../../buttons/round-color-toggle';
import { IconToggle } from '../../buttons/icon-toggle';
import { AlertService, AuthUserService, AuthenticationService } from '../../auth/_services';
declare var eventHub:THREE.Object3D;
eventHub = new THREE.Object3D();
declare var CFG:any;

@Component({
  selector: 'starter-page',
  templateUrl: 'starter.html'
})
/**
 * This is the scene when user enter the app, show his first place with sembo
 *
 */
export class StarterPage {

    private renderer: THREE.WebGLRenderer;
    private stats: Stats;
    private loading:boolean = false;
    private isAlert:boolean = false;
    private phase:string = "PhaseStart";
    private colorList:string[];
    private semboIdList:string[];
    private colorBtnList:RoundColorToggle[];
    private modelBtnList:IconToggle[];
    private activeLayer:HTMLElement;
    public scene: StarterView;
    
    private inactive: boolean = false;

    @ViewChild('container') containerRef: ElementRef;
    @ViewChild('contStarter') contStarter: ElementRef;
    @ViewChild('contChoose') contChoose: ElementRef;
    @ViewChild('contLogin') contLogin: ElementRef;
    @ViewChild('contUsername') contUsername: ElementRef;
    @ViewChild('contConfirm') contConfirm: ElementRef;
    @ViewChild('colorLine') colorLine: ElementRef;
    @ViewChild('inputName') inputName: ElementRef;
    @ViewChild('alertLine') alertLine: ElementRef;
    @ViewChild('loginName') loginName: ElementRef;
    @ViewChild('loginPswd') loginPswd: ElementRef;
    @ViewChild('labelWelcome') labelWelcome: ElementRef;
    @ViewChildren(RoundColorToggle) colorTogs : QueryList<RoundColorToggle>;
    @ViewChildren(IconToggle) modelTogs : QueryList<IconToggle>;

    constructor(
        private userService:UserService,
        private authUserService: AuthUserService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        public navCtrl: NavController,
        public viewCtrl: ViewController
    ) {
        this.colorList = ["#77c3ff", "#ff6699", "#ffff66", "#88aaaa"];
        this.semboIdList = ["A_py003_bird", "A_sdRabbit"];
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

        this.scene = new StarterView(container, this.userService);
        this.scene.semboIdList = this.semboIdList;
        this.scene.activeColor = (this.colorList[0]).substring(1); // remove leading #
        this.animate = this.animate.bind(this);
        this.animate();

        this.activeLayer = this.contStarter.nativeElement;
        let self  = this;
        setTimeout(()=>{
            self.fadeInLayer(this.activeLayer);
        }, 500);
        

        // find all Toggle children
        this.colorBtnList = this.colorTogs.toArray();
        this.modelBtnList = this.modelTogs.filter(el => el.filterId == "modelTog");
    }

    fadeOutActiveLayer() {
        this.activeLayer.style.pointerEvents = "none";
        let idStr = "#" + this.activeLayer.id;
        $(idStr).fadeOut(400);
    }

    fadeInLayer(newLayer:HTMLElement) {
        this.activeLayer.style.display = "none";
        this.activeLayer = newLayer;
        this.activeLayer.style.display = "block";
        this.activeLayer.style.opacity = "0";
        this.activeLayer.style.pointerEvents = "auto";
        let idStrNew = "#" + this.activeLayer.id;
        $(idStrNew).animate({ opacity: 1 });
    }

    switchNewLayer(newLayer:HTMLElement) {
        let self = this;
        this.alertLine.nativeElement.style.display = "none";
        this.fadeOutActiveLayer();
        setTimeout(()=>{
            self.fadeInLayer(newLayer);
        }, 400);
    }

    toChoose() {
        let self = this;
        if (this.phase != "PhaseChoosePet") {
            this.phase = "PhaseChoosePet";
            this.modelBtnList[0].turnOn();
            this.colorBtnList[0].turnOn();
            this.scene.phaseToChoosePet();

            this.loading = true;
            this.scene.controls.enabled = true;
            this.fadeOutActiveLayer();

            this.scene.onloadBasePetsFinish = function() {
                self.loading = false;
                self.fadeInLayer(self.contChoose.nativeElement);
            }
        }
        else {
            this.scene.controls.enabled = true;
            this.switchNewLayer(this.contChoose.nativeElement);
        }
    }

    toStart() {
        this.switchNewLayer(this.contStarter.nativeElement);
        this.scene.controls.enabled = false;
    }

    toLogin() {
        this.switchNewLayer(this.contLogin.nativeElement);
        this.scene.controls.enabled = false;
    }

    toUsername() {
        this.switchNewLayer(this.contUsername.nativeElement);
        this.scene.controls.enabled = false;
    }

    onConfirm() {
        this.scene.controls.enabled = true;
        this.switchNewLayer(this.contConfirm.nativeElement);
    }

    showErrorMessage(msg:string) {
        this.alertLine.nativeElement.style.display = "block";
        this.alertLine.nativeElement.innerHTML = msg;
    }

    doLogin(username:string, password:string) {
        this.loading = true;
        this.authenticationService.login(username, password)
        .subscribe(
            data => {
                this.loading = false;
                this.onConfirm();
                this.labelWelcome.nativeElement.innerHTML = "Welcome " + data.username + "!"
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
                if (error["error"] != undefined) {
                    if (error.error["message"] != undefined) {
                        this.showErrorMessage(error.error.message);
                    }
                }
                else {
                    this.showErrorMessage("Unknown error");
                }
            });
    }

    doRegister(namestr) {
        this.loading = true;
        let newUser:any = {
            username: namestr,
            password: "",
            ownedSembos:undefined,
            desc1: this.scene.activeSembo.semboId,
            desc2: this.scene.activeColor
        };
        this.authUserService.registerSimple(newUser)
        .subscribe(
            data => {
                this.alertService.success('Registration successful', true);
                if (data["password"] != undefined) {
                    this.doLogin(namestr, data["password"]);
                }
                else {
                    this.loading = false;
                    this.showErrorMessage("Unknown error");
                }
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
                if (error["error"] != undefined) {
                    if (error.error["message"] != undefined) {
                        this.showErrorMessage(error.error.message);
                    }
                }
                else {
                    this.showErrorMessage("Unknown error");
                }
            });
    }

    onLogin() {
        this.alertLine.nativeElement.style.display = "none";
        let namestr:string = this.loginName.nativeElement.value;
        let pswdstr:string = this.loginPswd.nativeElement.value;
        if (namestr.length < 3 || pswdstr.length < 3) {
            this.showErrorMessage("Username or password invalid.");
        }
        else {
            this.doLogin(namestr, pswdstr);
        }
    }

    onRegister() {
        this.alertLine.nativeElement.style.display = "none";
        let namestr:string = this.inputName.nativeElement.value;
        if (namestr.length < 3 || namestr.length > 25) {
            this.showErrorMessage("Username must be longer than 3 charactors");
        }
        else {
            this.doRegister(namestr);
        }
    }

    turnOffOtherModelBtn(index:number) {
        this.modelBtnList.forEach((btn:IconToggle) => {
            if (btn.index != index) btn.turnOff();
        });
    }

    onChooseModel(index:number) {
        this.turnOffOtherModelBtn(index);
        this.scene.chooseModel(index);
    }

    turnOffOtherColorBtn(color:string) {
        this.colorBtnList.forEach((btn:RoundColorToggle) => {
            if (btn.bcolor != color) btn.turnOff();
        });
    }

    onChooseColor(color:string) {
        this.turnOffOtherColorBtn(color);
        this.scene.chooseColor(color.substring(1));
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
