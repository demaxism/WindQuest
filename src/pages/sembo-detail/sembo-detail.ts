import { AfterViewInit, Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
declare var CFG:any;
declare var Util:any;

@Component({
  selector: 'page-sembo-detail',
  templateUrl: 'sembo-detail.html'
})
export class SemboDetailPage {

  private semboId:string;
  public semboThumbUrl: string; // sembo thumbnail image url
  public showingSembo: any = {}; // sembo object
  public hasParents:boolean = false;
  public parentAUrl:string = "";
  public parentBUrl:string = "";

  constructor(
    private navParams: NavParams,
    private userService:UserService,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {
    this.semboId = navParams.get('semboId');
    let self = this;
    let iconId = Util.iconId(this.semboId);
    this.userService.thumbnailUrl(iconId, (resUrl) => {
      self.semboThumbUrl = resUrl;
    });
    this.showingSembo = this.userService.getSemboById(this.semboId);

    // get parents thumbs url
    let parents = this.showingSembo.parent;
    if (parents.length == 2) {
      let parentAId = parents[0];
      let parentBId = parents[1];

      this.userService.thumbnailUrl(parentAId, (resUrl) => {
        self.parentAUrl = resUrl;
      });
      this.userService.thumbnailUrl(parentBId, (resUrl) => {
        self.parentBUrl = resUrl;
      });
      this.hasParents = true;
    }
    else {
      this.hasParents = false;
    }
  }

  onBack() {
    this.navCtrl.pop();
  }
}