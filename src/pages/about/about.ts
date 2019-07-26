import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import * as Cropper from '../../assets/js/cropper.js';
declare var Cropper:any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  private isFlipped:boolean = false;
  private stream:any;
  private video:HTMLVideoElement;
  private canvas:HTMLCanvasElement;
  private cameraPort:HTMLElement;
  private videoCont:HTMLElement;
  private captured:HTMLImageElement;
  private croppedCont:HTMLElement;
  private croppedPhoto:HTMLElement;
  private cropper:any;
  private portion:number = 0.8;

  @ViewChild('dbgInfo') dbgInfo: ElementRef;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {

  }

  private createScene() {
    this.cameraPort = document.getElementById( 'cameraPort' );
    this.video = document.querySelector('video');
    this.videoCont = document.getElementById('videoCont');
    this.captured = document.getElementById('capture') as HTMLImageElement;
    this.croppedPhoto = document.getElementById( 'croppedPhoto' );
    this.croppedCont = document.getElementById( 'croppedCont' );
    (this.croppedPhoto as HTMLImageElement).width = this.cameraPort.clientWidth * this.portion;
    (this.croppedPhoto as HTMLImageElement).height = this.cameraPort.clientHeight * this.portion;
    this.dbgInfo.nativeElement.innerHTML = "using camera:cam, (flip), capt, crop; using file: choose file, crop";
  }

  private initCamera() {
    const constraints = {
      video: true
    };

    try {
      let self = this;
      navigator.mediaDevices.getUserMedia(constraints).
        then((stream) => {
          self.video.srcObject = stream;
          self.stream = stream;
        });
    }
    catch(err) {
      this.dbgInfo.nativeElement.innerHTML = err.message;
    }
  }

  /* LIFECYCLE */
  ngAfterViewInit() {
    this.createScene();
  }

  onBtnBack() {
    window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "Playground"})); 
  }

  onBtnCam() {
    this.initCamera();
  }

  onBtnFlip() {
    if (this.isFlipped) {
      this.videoCont.style.transform = "scale(1, 1)";
      this.isFlipped = false;
    }
    else {
      this.videoCont.style.transform = "scale(-1, 1)";
      this.isFlipped = true;
    }
  }

  onBtnCapture() {
    let self = this;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.video.videoWidth ;
    this.canvas.height = this.video.videoHeight ;
    //this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    let context = this.canvas.getContext('2d');
    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    if (this.isFlipped) {
      var imageData = context.getImageData(0,0, this.canvas.width, this.canvas.height);

      // Traverse every row and flip the pixels
      for (let i=0; i<imageData.height; i++)
      {
      // We only need to do half of every row since we're flipping the halves
        for (let j=0; j<imageData.width/2; j++)
        {
          var index=(i*4)*imageData.width+(j*4);
          var mirrorIndex=((i+1)*4)*imageData.width-((j+1)*4);
          for (let p=0; p<4; p++)
          {
            var temp=imageData.data[index+p];
            imageData.data[index+p]=imageData.data[mirrorIndex+p];
            imageData.data[mirrorIndex+p]=temp;
          }
        }
      }
      context.putImageData(imageData,0,0,0,0, imageData.width, imageData.height);
    }

    let img:HTMLImageElement = document.getElementById("capture") as HTMLImageElement;
    img.src = this.canvas.toDataURL();
    // stop video stream
    this.stream.getVideoTracks().forEach(function(track) {
      track.stop();
      self.video.style.display = "none";
    });
    setTimeout(() => {
      self.adjust();
    }, 500);
  }

  onPicSelected(event) {
    this.video.style.display = "none";
    let fileInput = event.target.files[0];
    var reader  = new FileReader();

    let self = this;
    reader.onload = function(e:any)  {
        self.captured.src = e.target.result;
        setTimeout(() => {
          self.adjust();
        }, 500);
    }
    reader.readAsDataURL(fileInput);
  }

  savePhoto() {
    let outputResolution = {width:500, height:500}; // can be any value, resolution of output image
    var imageDataURL = this.cropper.getCroppedCanvas(outputResolution).toDataURL('image/jpeg');
    //this.dbgInfo.nativeElement.innerHTML = imageDataURL;
    let destImage:HTMLImageElement = document.getElementById("croppedPhoto") as HTMLImageElement;
    destImage.src = imageDataURL;
  }

  adjust() {
    let image:HTMLImageElement = document.getElementById("capture") as HTMLImageElement;
    let iw = image.naturalWidth;
    let ih = image.naturalHeight;
    let x, y;
    let dim = Math.max(iw,ih) * this.portion; // area dimension in pixel scale of the original image.
    x = (iw - dim)/2;
    y = (ih - dim)/2;
    let self = this;

    this.cropper = new Cropper(image, {
      aspectRatio: 1/1,
      // scalable:false,
      // zoomable:false,
      // movable:false,
      dragMode:'move', // crop move none
      cropBoxMovable:false,
      cropBoxResizable:false,
      toggleDragModeOnDblclick:false,
      data: {
        x:x,
        y:y,
        width:dim,
        height:dim
      },
      crop(event) {
        console.log(event.detail.x);
        console.log(event.detail.y);
        console.log(event.detail.width);
        console.log(event.detail.height);
      },
      ready() {
        // when crop widget is ready
        
      }
    });
  }

  onBtnCrop() {
    this.cameraPort.style.display = "none";
    this.croppedCont.style.display = "block";
    this.savePhoto();
  }
}
