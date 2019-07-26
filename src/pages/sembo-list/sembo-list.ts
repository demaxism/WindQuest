import { AfterViewInit, Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NavController, ViewController } from 'ionic-angular';
import * as Stats from '../../assets/js/libs/stats.min.js';
import { User } from '../../models/user';
import { UserService } from '../../providers/user-service';
import { AuthUserService } from '../../auth/_services';
import { DialogControl } from '../../views/DialogControl';
import { SemboDetailPage } from '../../pages/sembo-detail/sembo-detail';
declare var CFG:any;
declare var Util:any;

@Component({
    selector: 'page-sembo-list',
    templateUrl: 'sembo-list.html'
})
export class SemboListPage {

  private user:User;
  private stats: Stats;
  private loading:boolean = false;
  private selectAction:Function;
  private showingSemboId: string;
  private placeSemboId: string;
  private occupiedSembos:any = {};
  private isSelected:boolean = false; // is any sembo selected
  private showMoveIn:boolean = false;
  private showMoveOut:boolean = false;
  private nFrame:number = 0;
  private btnBackOpacity:number = 0;
  public moveOutPetDialog:DialogControl = new DialogControl();
  public moveInPetDialog:DialogControl = new DialogControl();
  public sembos: any[] = [];
  public serverName:string;
  public semboThumbUrl: string; // sembo thumbnail image url
  public showingSembo: any = {}; // sembo object

  @ViewChild('btnBackBottom') btnBackBottom: ElementRef;
  @ViewChild('btnSort') btnSort: ElementRef;
  @ViewChild('container') containerRef: ElementRef;
  @ViewChild('scrollCont') scrollContRef: ElementRef;

  constructor(
    private platform: Platform,
    private userService:UserService,
    private authUserService: AuthUserService,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {
    let self = this;
    this.selectAction = (semboId) => {
      self.showThumbnail(semboId);
    };
    this.moveOutPetDialog.parent = this;
    this.moveOutPetDialog.okAction = this.moveOutConfirmed;
    this.moveInPetDialog.parent = this;
    this.moveInPetDialog.okAction = this.moveInConfirmed;
  }

  ngAfterViewInit() {
    let container: HTMLElement = this.containerRef.nativeElement;
    this.stats = new Stats();
    container.appendChild( this.stats.dom );
    this.stats.dom.style.top = "300px";
  }

  showThumbnail(sembId) {
    this.isSelected = true;
    this.showingSemboId = sembId;
    let self = this;
    let iconId = Util.iconId(sembId);
    this.userService.thumbnailUrl(iconId, (resUrl) => {
      self.semboThumbUrl = resUrl;
    });
    this.showingSembo = this.userService.getSemboById(sembId);
    if (this.showingSembo == null) {
      this.showingSembo = {};
    }
    else {
      if (this.showingSembo.created_time != null) {
        this.showingSembo.birthStr = (this.showingSembo.created_time.split('-'))[0];
      }

      if (this.showingSembo.name == null) {
        this.showingSembo.name = "杂交生物"
      }

      if (this.showingSembo.typeStr == null) {
        this.showingSembo.typeStr = Util.semboTypeStr(this.showingSembo.type);
      }
    }

    $('#btnOps').css("opacity", "0");
    $("#btnOps").animate({ opacity: 1 }, 400);

    // unselect all
    this.sembos.forEach((element) => {
      if (element.semboId.length > 1) {
        if (element.semboId == sembId) {
          element.childAction("select");
        }
        else {
          element.childAction("unselect");
        }
      }
    });

    // opsButtons
    if (sembId == this.placeSemboId) {
      this.showMoveIn = false;
      this.showMoveOut = true;
    }
    else if (this.occupiedSembos[sembId] == true) {
      this.showMoveIn = false;
      this.showMoveOut = false;
    }
    else {
      this.showMoveIn = true;
      this.showMoveOut = false;
    }
  }

  moveOut() {
    this.moveOutPetDialog.show();
  }

  moveOutConfirmed() {
    if (this.showingSemboId == this.placeSemboId) {
      let placeIndex = this.userService.activePlace;
      let currentPlaceData = this.userService.currentUser.places[placeIndex];
      let placeName = Object.keys(currentPlaceData)[0];
      currentPlaceData[placeName] = "";
      this.loading = true;
      this.authUserService.updateUser(this.userService.currentUser).subscribe(user => {
        this.userService.updateCurrentUser(user);
        //window.dispatchEvent(new CustomEvent("EVT_POP_VIEW"));
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "HomePage"}));
      });
    }
  }

  moveIn() {
    this.moveInPetDialog.show();
  }

  onDetail() {
    this.navCtrl.push(SemboDetailPage, { semboId: this.showingSemboId });
  }

  moveInConfirmed() {
    let placeIndex = this.userService.activePlace;
    let currentPlaceData = this.userService.currentUser.places[placeIndex];
    let placeName = Object.keys(currentPlaceData)[0];
    currentPlaceData[placeName] = this.showingSemboId;
    this.loading = true;
    this.authUserService.updateUser(this.userService.currentUser).subscribe(user => {
      this.userService.updateCurrentUser(user);
      //window.dispatchEvent(new CustomEvent("EVT_POP_VIEW"));
      window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "HomePage"}));
    });
  }

  onBtnBack() {
    //window.dispatchEvent(new CustomEvent("EVT_POP_VIEW")); 
    window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "HomePage"}));
  }

  updateSemboArray() {
    this.sembos = null;
    this.sembos = [];
    this.userService.currentUser.owned_sembos.forEach(element => {
      let value = {};
      value["semboId"] = element;
      value["action"] = this.selectAction;
      value["checkPos"] = undefined; // used to call thumbnail from parent
      value["childAction"] = undefined; // used to call thumbnail from parent
      value["isCurrent"] = (element == this.placeSemboId);
      value["isSelected"] = value["isCurrent"];
      value["isOccupied"] = (this.occupiedSembos[element] == true);
      this.sembos.push(value);
    });

    // sort by date
    let self = this;
    this.sembos.sort((a, b) => {
      // ensure placeSemboId on top
      if (a.semboId == this.placeSemboId) return -1;
      if (b.semboId == this.placeSemboId) return 1;
      // move occupied sembo up
      if (self.occupiedSembos[a.semboId] == true) return -1;
      if (self.occupiedSembos[b.semboId] == true) return 1;

      // normal sorting
      if (a.datetime > b.datetime) return 1;
      else return -1;
    });

    // padding last line holder, make the last line all empty
    let nline = 4;
    let npadding = (nline - this.sembos.length % nline) % nline + nline;
    for (let i = 0; i < npadding; i++) {
      this.sembos.push({semboId:""});
    }

    // place holder
    let nPlace = 40 - this.sembos.length;
    for (let i = 0; i < nPlace; i++) {
      this.sembos.push({semboId:""});
    }
  }

  @HostListener('window:scroll', ['$event']) 
  onListScroll(event) {
    this.nFrame = 0;

    for (let element of this.sembos) {
      if (element.checkPos != null)
        element.checkPos();
    }
  }

  animate() {
    requestAnimationFrame( this.animate );
    this.nFrame++;
    this.stats.update();
  }

  ionViewWillEnter() {
    // show current place's sembo
    let placeIndex = this.userService.activePlace;
    let currentPlaceData = this.userService.currentUser.places[placeIndex];
    let placeName = Object.keys(currentPlaceData)[0];
    this.placeSemboId = currentPlaceData[placeName];
    if (this.placeSemboId.length > 1) {
      this.showThumbnail(this.placeSemboId);
    }
    
    // occupied sembo dict
    this.userService.currentUser.places.forEach(element => {
      let plcn = Object.keys(element)[0];
      let semboId = element[plcn];
      this.occupiedSembos[semboId] = true;
    });

    this.updateSemboArray();

    this.animate = this.animate.bind(this);
    this.animate();

    // scroll
    if (this.platform.is("ios")) {
      Util.scrollableContainer("scrollBox");
    }
  }
}