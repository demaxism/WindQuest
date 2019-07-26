import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
declare var Util:any;
declare var CFG:any;

@Component({
  selector: 'sembo-thumbnail',
  templateUrl: 'sembo-thumbnail.html'
})
export class SemboThumbnail implements OnInit {

    @Input() semboObj: any;
    public thumbnailUrl: string;
    private isPlaceHolder: boolean = false;
    @ViewChild('mainThumb') mainThumb:ElementRef;
    @ViewChild('sideIcon') sideIcon:ElementRef;
    @ViewChild('btnCont') btnCont:ElementRef;

    constructor(
        private userService:UserService,
        public navCtrl: NavController,
        public viewCtrl: ViewController
    ) {
    }

    onClick() {
        // this.btnCont.nativeElement.style.backgroundColor = "#ff0000";
        // this.navCtrl.push(SemboView, {
        //     semboId: this.semboId
        // });
        if (!this.isPlaceHolder) {
            this.semboObj.action(this.semboObj.semboId);
        }
    }

    unselect() {
        this.btnCont.nativeElement.classList.remove('smSelected');
    }

    selected() {
        this.btnCont.nativeElement.classList.add('smSelected');
    }

    iconId(semboId:string):string {
        let parts:Array<string> = semboId.split("&");
        let iconFile = undefined;
        parts.forEach((p) => {
            let keyValue = p.split("=");
            if (keyValue.length == 2 && keyValue[0] == "icon") iconFile = keyValue[1]
        });

        if (iconFile != undefined) return iconFile;
        else return parts[0];
    }

    // why ionViewWillEnter not working?
    ngOnInit() {
        let self = this;
        // case of place holder
        if (this.semboObj.semboId == "") {
            this.btnCont.nativeElement.style.pointerEvents = "none";
            this.mainThumb.nativeElement.style.display = "none";
            this.sideIcon.nativeElement.style.display = "none";
            this.isPlaceHolder = true;
            return;
        }

        let iconId = this.iconId(this.semboObj.semboId);
        this.userService.thumbnailUrl(iconId, (resUrl) => {
            self.thumbnailUrl = resUrl;
        });
        // childAction is called by parent: sembo-list
        this.semboObj.childAction = (e)=> {
            if (e == "unselect") this.unselect();
            else if (e == "select") this.selected();
        };
        this.semboObj.checkPos = () => {
            let rect = this.btnCont.nativeElement.getBoundingClientRect();
            if (rect.y > $(window).height() || rect.y < 0) {
                this.mainThumb.nativeElement.style.display = "none";
            }
            else {
                this.mainThumb.nativeElement.style.display = "block";
            }
        };
        // this is select at init
        if (this.semboObj.isSelected == true) {
            this.selected();
        }
        if (this.semboObj.isCurrent == true) {
            this.btnCont.nativeElement.classList.add('smCurrent');
        }
        if (this.semboObj.isOccupied == true) {
            this.sideIcon.nativeElement.src = "assets/imgs/buttons/place_icon_empty.png";
        }
        else {
            this.sideIcon.nativeElement.style.display = "none";
        }
    }
}