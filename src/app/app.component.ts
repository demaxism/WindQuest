import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { EntryPage } from '../pages/entry/entry';
declare var CFG:any;
declare var Util:any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = EntryPage;
  fileTransfer: FileTransferObject = this.transfer.create();

  constructor(
    private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, 
    private file: File, private transfer: FileTransfer) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.hide();
      splashScreen.hide();
      this.fitScreen();
      this.init();
    });
  }

  fitScreen() {
    let winW = $(window).width();
    let winH = $(window).height();
    let tx = 0, ty = 0;

    // status bar gap
    if (this.platform.is('ios')) {
      //ty = 30;
    }

    let shell = document.getElementById( 'root-wrap' );
    let shellW = shell.clientWidth;
    let shellH = winH / winW * shellW - ty;
    shellH = Math.max(shellH, 550);
    shell.style.height =  shellH + "px";
    
    let scale = 1;
    

    if ( winW / winH >=  shellW / shellH ) {
        scale = winH / shellH;
        tx = (winW - shellW * scale) / 2 / scale;
    } else {
        scale = winW / shellW;
    }
    
    shell.style.transform = 
        "scale(" + scale + ", " + scale + ")" + 
        "translate(" + tx + "px, " + ty + "px)";
    shell.style.transformOrigin = "0% 0%";
    CFG.zoomRatio = scale;
    CFG.gapX = tx;
    CFG.gapY = ty;
    CFG.shellW = shellW;
    CFG.shellH = shellH; 
    Util.log("scale:" + scale);
    Util.log("logic w:" + shellW + " h:" + shellH);
    Util.log("tx:" + tx + " ty:" + ty);
  }

  init() {
    let self = this;
    // create 'downloads' dir
    this.file.checkDir(this.file.dataDirectory, 'downloads')
    .then(response => {
      Util.log('dir exists');
    })
    .catch(err => {
      Util.log('dir not exists, create');
      self.file.createDir(this.file.dataDirectory, 'downloads', true)
      .then(_ => {
        Util.log('dir created');
      })
      .catch(err => {
        Util.log('dir create fail');
      });
    });
/*
    // check file exist
    this.file.checkFile(this.file.dataDirectory, 'downloads/corgi.jpg')
    .then(response => {
      Util.log("dbg pic exist." + this.file.dataDirectory);
    })
    .catch(err => {
      Util.log("dbg pic not exist.")
    });

    // download sth
    let url  = encodeURI("http://52.194.219.251:8082/sembo_thumb/img_9d607293-6ab1-4e59-8e49-562db43045bb.png");
    this.fileTransfer.download(url, this.file.dataDirectory + 'downloads/corgi.jpg', true)
    .then(response => {
      Util.log("dbg pic downloaded." + response.toURL());
    })
    .catch(err => {
      Util.log("downloaded failed.");
    });
*/
  }
}
