import { Injectable } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import * as TWEEN from '../assets/js/tween.min.js';
declare var TWEEN:any;
declare var CFG:any;
declare var Util:any;
import { EntryPage } from '../pages/entry/entry';
import { LoadPage } from '../pages/load-page/load-page';
import { StarterPage } from '../pages/starter/starter';
import { HomePage } from '../pages/home/home';
import { Playground} from '../pages/playground/playground';
import { SailPage } from '../pages/sail-page/sail-page';
import { VisitPage } from '../pages/visit-page/visit-page';
import { BattlePage } from '../pages/battle-page/battle-page';
import { AboutPage } from '../pages/about/about';
import { SemboListPage } from '../pages/sembo-list/sembo-list';
import { RegisterComponent } from '../auth/register';
import { LoginComponent } from '../auth/login';
import { AuthHomeComponent } from '../auth/home';
declare var CFG;

@Injectable()
export class RootController {

    private navCtrl: NavController;
    private viewCtrl: ViewController;

    constructor( ) { 
    }

    init(
        navCtrl: NavController
    ) {
        this.navCtrl = navCtrl;

        this.pushView = this.pushView.bind(this);
        this.routeView = this.routeView.bind(this);
        this.routeViewNoAnim = this.routeViewNoAnim.bind(this);
        this.popView = this.popView.bind(this);
        CFG.eventRegFunc("EVT_PUSH_VIEW", this.pushView);
        CFG.eventRegFunc("EVT_ROUTE_VIEW", this.routeView);
        CFG.eventRegFunc("EVT_ROUTE_VIEW_NOANIM", this.routeViewNoAnim);
        CFG.eventRegFunc("EVT_POP_VIEW", this.popView);
    }

    classOf(dest:string) {
        let className = null;
        switch (dest) {
            case "AboutPage":
            className = AboutPage;
            break;

            case "EntryPage":
            className = EntryPage;
            break;

            case "LoadPage":
            className = LoadPage;
            break;

            case "StarterPage":
            className = StarterPage;
            break;

            case "HomePage":
            className = HomePage;
            break;

            case "Playground":
            className = Playground;
            break;

            case "SailPage":
            className = SailPage;
            break;

            case "VisitPage":
            className = VisitPage;
            break;

            case "BattlePage":
            className = BattlePage;
            break;
            
            case "SemboListPage":
            className = SemboListPage;
            break;

            case "Register":
            className = RegisterComponent;
            break;

            case "Login":
            className = LoginComponent;
            break;

            case "AuthHome":
            className = AuthHomeComponent;
            break;

            default:
            break;
        }

        return className;
    }

    popView() {
        TWEEN.removeAll();
        this.navCtrl.pop();
    }
 
    pushView(e) {
        TWEEN.removeAll();
        let className = this.classOf(e.detail);
        if (className != null) {
            let currentView:any = this.navCtrl.getActive();
            this.navCtrl.push(className).then(() => {
                
            });
        }
    }

    routeView(e) {
        TWEEN.removeAll();
        let className = this.classOf(e.detail);
        if (className != null) {
            let currentView:any = this.navCtrl.getActive();
            this.navCtrl.push(className).then(() => {
                currentView.dismiss(); // then remove the current page
            });
        }
    }

    routeViewNoAnim(e) {
        TWEEN.removeAll();
        let className = this.classOf(e.detail);
        if (className != null) {
            let currentView:any = this.navCtrl.getActive();
            this.navCtrl.push(className, null, { animate: false }).then(() => {
                currentView.dismiss(); // then remove the current page
            });
        }
    }
}