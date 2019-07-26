import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../providers/user-service';
import { NavController, ViewController } from 'ionic-angular';
import { AuthenticationService } from '../../auth/_services';

@Component({
  selector: 'load-page',
  template: `
    <div *ngIf="loading" class="loadingCover"><div class="loadingSign lds-dual-ring"></div></div>
  `,
  styles: [`
    .scroll-content {
      overflow: hidden;
    }
  `]
})
export class LoadPage {

  private loading:boolean = false;
  private dest:String;
  private username:string;

  constructor(
    private userService:UserService,
    private authenticationService: AuthenticationService,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {
  }

  enterGame() {
    window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: this.dest}));
  }
  
  toStartPage() {
    this.dest = "StarterPage";
    this.enterGame();
  }

  doLogin(username:string, password:string) {
    this.loading = true;
    this.authenticationService.login(username, password)
    .subscribe(
      data => {
        // login success
        this.dest = "HomePage";
        this.enterGame();
      },
      error => {
        this.toStartPage();
      });
  }

  doGetInitInfo() {
    let self = this;
    this.userService.getInitInfo().subscribe( (data:any) => {
      self.toStartPage();
    });
  }

  /* LIFECYCLE */
  ngAfterViewInit() {
    this.loading = true;
    let self = this;
    let password:string;

    this.userService.getLocalCurrentUser((userData:any) => {
      if (userData != undefined) {
        this.username = userData.username;
      }
      self.userService.getLocalPassword((data:any) => {
          password = data;
          if (self.username != undefined && password != undefined) {
            self.doLogin(self.username, password);
          }
          else {
            self.doGetInitInfo();
          }
      });
    })
  }

  ngOnDestroy() {
  }
}