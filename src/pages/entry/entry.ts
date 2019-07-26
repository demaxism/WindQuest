import { ViewChild, Component, ElementRef } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NavController, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
import { UserService } from '../../providers/user-service';
import { RootController } from '../../providers/root-controller';
import { AuthUser } from '../../auth/_models';
import { AuthUserService } from '../../auth/_services';
import { AuthenticationService } from '../../auth/_services';
import { VisitingPlace } from '../../models/VisitingPlace';
import { SemboView } from '../../pages/sembo-view/sembo-view';
import { Camera, CameraOptions } from "@ionic-native/camera";
declare var CFG:any;

@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  private user:User;
  private dest:String;
  private currentUser: AuthUser;

  public myPhote:any;
  public isEndpointLocal:Boolean = false;

  @ViewChild('dbgLabelUser') dbgLabelUser: ElementRef;
  @ViewChild('detailText') detailText: ElementRef;

  constructor(
    private platform: Platform,
    private userService:UserService,
    private camera:Camera,
    private authUserService: AuthUserService,
    private authenticationService: AuthenticationService,
    public rootController: RootController,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {
    this.rootController.init(this.navCtrl);
    
  }

  enterGame() {
    window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: this.dest}));
  }

  fetchData(username:string) {
    let self = this;
    this.userService.fetchUserData(username)
    .subscribe(data => {
      let u = self.userService.user;
      if (u != null) {
        self.enterGame();
      }
    });
  }

  onLocalChange() {
    if (this.isEndpointLocal) {
      CFG.backEnd = CFG.backEndLocal;
      console.log("toggle to local");
    }
    else {
      CFG.backEnd = CFG.backEndRemote;
      console.log("toggle to remote");
    }
  }
 
  onBtnPlayground() {
    this.authenticationService.login("test003", "abc123")
    .subscribe(
      data => {
        // login success
        this.dest = "Playground";
        this.enterGame();
      },
      error => {
        
      });
  }

  goBattle() {
    this.userService.visitingPlace = new VisitingPlace();
    this.userService.visitingPlace.landSemboId = "A_py002_haima";
    this.authenticationService.login("test003", "abc123")
    .subscribe(
      data => {
        // login success
        this.dest = "BattlePage";
        this.enterGame();
      },
      error => {
        
      });
  }

  goSemboView() {
    this.authenticationService.login("test003", "abc123")
    .subscribe(
      data => {
        // login success
        this.navCtrl.push(SemboView, { semboId: null });
      },
      error => {
        
      });
  }

  onBtnHome() {
    this.goBattle();
    //this.goSemboView();
  }

  onBtnTop() {
    this.dest = "AuthHome";
    this.enterGame();
  }

  onBtnRegister() {
    this.dest = "Register";
    this.enterGame();
  }

  onBtnLogin() {
    this.dest = "Login";
    this.enterGame();
  }

  /*
  * In release ver, proceed is auto triggered after ngAfterViewInit
  */
  onBtnProceed() {
    this.dest = "LoadPage";
    this.enterGame();
  }

  onBtnClear() {
    this.userService.clearLocalCurrentUser();
  }

  onBtnReload() {
    this.dest = "EntryPage";
    this.enterGame();
  }

  onBtnTest() {
    // test auth, if not logged in (no currentUser in local storage), getAll will fail
    // let users;
    // this.authUserService.getById("5b99e715f8e4860e922fbff5").subscribe(users => { 
    //   users = users; 
    // });
    this.userService.getQuest("sea_001", "5b99e715f8e4860e922fbff5").subscribe( data => {
      let a  = data;
    });
  }

  onAbout() {
    this.dest = "AboutPage";
    this.enterGame();
  }

  onCamera() {
    // will not used this ionic/camera, will use javascript's mediaDevices.getUserMedia for camera
    // see in About.ts
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     let base64Image = 'data:image/jpeg;base64,' + imageData;
     this.myPhote = base64Image;
    }, (err) => {
     // Handle error
    });
  }

  private touchStart:any;
  private scrollStart:any;
  private touching:boolean = false;
  private contDiv:Element;

  /* LIFECYCLE */
  ngAfterViewInit() {
    let self = this;
    let username:string;
    let password:string;
    this.userService.getLocalCurrentUser((userData:any) => {
      self.currentUser = userData;
      if (self.currentUser != undefined) {
        username = self.currentUser.username;
      }
      
      self.dbgLabelUser.nativeElement.innerText = username;
      self.userService.getLocalPassword((data:any) => {
        password = data;
        self.dbgLabelUser.nativeElement.innerText = username + ": " + password;
      });
    });

    // scroll
    if (this.platform.is("ios")) {

      this.contDiv = document.getElementsByClassName("scroll-content")[0];
      $('.scroll-content').bind('touchstart', function(e) {
        self.touching = true;
        self.scrollStart = {x:self.contDiv.scrollLeft, y:self.contDiv.scrollTop};
        self.touchStart = {x:e.pageX, y:e.pageY};
      });
      $('.scroll-content').bind('touchend', function(e) {
        self.touching = false;
      });
      $('.scroll-content').bind('touchmove', function(e) {
        e.preventDefault();
        
        if (self.touching) {
          let v = self.scrollStart.y - ( e.pageY - self.touchStart.y ) / CFG.zoomRatio;
          self.dbgLabelUser.nativeElement.innerText = v.toString();
          self.contDiv.scrollTop = v;
        }
      });
    }
  }

}
