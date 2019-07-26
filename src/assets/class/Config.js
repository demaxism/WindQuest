var CFG = CFG || {};

CFG.endPoint = "https://bez3uq2r13.execute-api.ap-northeast-1.amazonaws.com/sembodev";
CFG.backEndLocal = "http://localhost:8080";
CFG.backEndRemote = "https://demaxism.com:8082";
CFG.backEnd = CFG.backEndRemote;
CFG.s3bucket = "https://s3-ap-northeast-1.amazonaws.com/sembobucket/";
CFG.zoomRatio = 1;
CFG.gapX = 0;
CFG.gapY = 0;
CFG.shellW = 0; // container logic width, px scale in css is based on this width, action screen pixel is CFG.shellW * zoomRatio, defined in app.scss #root-wrap
CFG.shellH = 0; // calculated in app.component.ts
CFG.eventRegFlag = {}; // flag for marking whether a event is registered

function eventReg(eventName, func) {
  let eventRegKey = "root-controller-" + eventName;
  if (CFG.eventRegFlag[eventRegKey] == null) {
    window.addEventListener(eventName, func);
    CFG.eventRegFlag[eventRegKey] = "1";
  }
}

CFG.eventRegFunc = eventReg;

// used in Util scrollableContainer
CFG.touchStart = null;
CFG.scrollStart = null;
CFG.isTouching = false;
CFG.scrollCont