import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatGridListModule } from '@angular/material';
import { Camera, CameraOptions } from "@ionic-native/camera";

// auth start
import { ReactiveFormsModule }    from '@angular/forms';
import { AlertComponent } from '../auth/_directives';
import { JwtInterceptor, ErrorInterceptor } from '../auth/_helpers';
import { AlertService, AuthenticationService, AuthUserService } from '../auth/_services';
import { AuthHomeComponent } from '../auth/home';
import { LoginComponent } from '../auth/login';
import { RegisterComponent } from '../auth/register';
// auth end

import { UserService } from '../providers/user-service';
import { RootController } from '../providers/root-controller';
import { AboutPage } from '../pages/about/about';
import { EntryPage } from '../pages/entry/entry';
import { LoadPage } from '../pages/load-page/load-page';
import { StarterPage } from '../pages/starter/starter';
import { HomePage } from '../pages/home/home';
import { Playground} from '../pages/playground/playground';
import { GachaPage } from '../pages/gacha/gacha-page';
import { SailPage } from '../pages/sail-page/sail-page';
import { VisitPage } from '../pages/visit-page/visit-page';
import { BattlePage } from '../pages/battle-page/battle-page';
import { TabsPage } from '../pages/tabs/tabs';
import { SemboListPage } from '../pages/sembo-list/sembo-list';
import { SemboDetailPage } from '../pages/sembo-detail/sembo-detail';
import { SemboThumbnail } from '../pages/sembo-thumbnail/sembo-thumbnail';
import { SemboView } from '../pages/sembo-view/sembo-view';
import { ConfirmDialog } from '../views/confirm-dialog';
import { ButtonCommon } from '../buttons/button-common';
import { FadeMask } from '../views/FadeMask';
import { PercentBar } from '../views/PercentBar';
import { JumpText } from '../views/JumpText';
import { RoundColorToggle } from '../buttons/round-color-toggle';
import { IconToggle } from '../buttons/icon-toggle';
import { ScaleButton } from '../buttons/scale-button';
import { PlaceChooseToggle } from '../buttons/place-choose-toggle';
import { DebugButton } from '../buttons/debug-button';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    AlertComponent,
    AuthHomeComponent,
    LoginComponent,
    RegisterComponent,
    AboutPage,
    EntryPage,
    LoadPage,
    StarterPage,
    HomePage,
    Playground,
    GachaPage,
    SailPage,
    VisitPage,
    BattlePage,
    TabsPage,
    SemboThumbnail,
    SemboListPage,
    SemboDetailPage,
    SemboView,
    ConfirmDialog,
    ButtonCommon,
    FadeMask,
    PercentBar,
    JumpText,
    RoundColorToggle,
    PlaceChooseToggle,
    ScaleButton,
    DebugButton,
    IconToggle
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatGridListModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    EntryPage,
    LoadPage,
    StarterPage,
    HomePage,
    GachaPage,
    SailPage,
    VisitPage,
    BattlePage,
    RegisterComponent,
    AuthHomeComponent,
    LoginComponent,
    Playground,
    TabsPage,
    SemboListPage,
    SemboDetailPage,
    SemboView
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AlertService,
    AuthenticationService,
    AuthUserService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    UserService,
    RootController,
    File,
    FileTransfer,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
