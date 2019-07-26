import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import * as THREE from '../../assets/js/three';
import * as DemoView from '../../assets/class/DemoView';
import { UserService } from '../../providers/user-service';
declare var DemoView:any;
declare var Util:any;
declare var CFG:any;

@Component({
  selector: 'sembo-view',
  templateUrl: 'sembo-view.html'
})
export class SemboView {

    
    @ViewChild('cont') cont: ElementRef;
    @ViewChild('viewTitle') viewTitle: ElementRef;
    @ViewChild('demoBox') demoBox: ElementRef;
    private rendererDemo: THREE.WebGLRenderer;
    private demoView: THREE.Scene;
    private userId:string;
    private semboId: string; // breeded new sembo
    private semboObject:any;
    private showOptBtns:boolean = false;
    public actionFinished:Function;

    constructor(
        private navParams: NavParams,
        private userService:UserService,
        public navCtrl: NavController,
        public viewCtrl: ViewController
    ) {
        //this.semboId = navParams.get('semboId');
    }

    private createDemoBox() {
        this.showOptBtns = true;
        // 3D
        let container: HTMLElement = this.demoBox.nativeElement;
        this.rendererDemo = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
        // set preserveDrawingBuffer to true to enable canvas image save
        this.rendererDemo.setPixelRatio( window.devicePixelRatio );
        this.rendererDemo.setSize( container.clientWidth, container.clientHeight );
        container.appendChild( this.rendererDemo.domElement );
        this.rendererDemo.domElement.setAttribute("id", "demoBox3d");

        this.demoView = new DemoView(container, this.rendererDemo, this.userService);
        this.demoView.loadSembo(this.semboId);
    }

    breed() {
        this.cont.nativeElement.style.display = "block";
        let self = this;
        let sembo1Id = this.userService.selfSembo.semboId;
        let sembo2Id = this.userService.enemySembo.semboId;
        this.userId = this.userService.currentUser.username; // get from userService. be used in DemoView capture

        let url = CFG.backEnd + "/api?method=breed&id1=" + sembo1Id + "&id2=" + sembo2Id;
        $.get(url, function(data) {
            self.semboId = data.semboId;
            self.semboObject = data.semboObject;
            self.viewTitle.nativeElement.innerHTML = "Sembo:" + self.semboId.substring(0, 6);
            self.createDemoBox();
        });
    }

    // why ionViewWillEnter not working?
    ngAfterViewInit() {
        
    }

    onSave() {
        let self = this;
        let canvas:any = document.getElementById("demoBox3d"); 
        let image = canvas.toDataURL();
        image = image.replace(/^data:image\/\w+;base64,/, "");

        $.post(CFG.backEnd + "/api?method=save_data&semboId=" + this.semboId + "&userId=" + this.userId, {data: image}, function(result){
            Util.log("breed save cb:" + result);
            self.userService.currentUser.owned_sembos.push(self.semboId);
            self.userService.semboSpecCache.sembos[self.semboId] = self.semboObject;
            self.showOptBtns = false;
            self.actionFinished();
        });
    }

    onDiscard() {
        let self = this;
        let url = CFG.backEnd + "/api?method=delete_sembo&semboId=" + this.semboId;
        $.get(url, function(data) {
            Util.log("breed discard cb:" + data);
            self.showOptBtns = false;
            self.actionFinished();
        });
    }

    ngOnDestroy() {
        this.demoView.destroy();
        this.demoView = null;
    }
}