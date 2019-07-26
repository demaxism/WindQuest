class Util {
  static findMaterial(material, matName) {
    // case of single material
    if (material.name == matName) {
        return material;
    }
    // case of multiple material
    else if (material.length > 1) {
        for (let i = 0; i < material.length; i++) {
            if (material[i].name == matName) {
                return material[i];
            }
        }
    }
    return undefined;
  }

  static findChildMaterail(children, matName) {
    for (let childIdx in children) {
      let child = children[childIdx];
      if (child.material != null) {
        let res = Util.findMaterial(child.material, matName);
        if (res != null) {
          return res;
        }
      }
    }
  }

  static findChildByName(children, childName) {
    for (let childIdx in children) {
      let child = children[childIdx];
      if (child.name == childName) {
        return child;
      }
    }
    return undefined;
  }

  static findFirstMaterial(material) {
    if (material.constructor === Array) {
        return material[0];
    } else {
        return material;
    }     
  }

  static trimLR(name) {
    if (name.slice(-1) == "L" || name.slice(-1) == "R") {
      return name.slice(0, -1);
    }
    return name;
  }

  // eyeL_A_crab to eyeL
  static partIdToClass(partId) {
    let arr = partId.split("_");
    return arr[0];
  }

  static pureId(semboId) {
    return semboId.split("&")[0];
  }

  static iconId(semboId) {
    let parts = semboId.split("&");
    let iconFile = undefined;
    parts.forEach((p) => {
        let keyValue = p.split("=");
        if (keyValue.length == 2 && keyValue[0] == "icon") iconFile = keyValue[1]
    });

    if (iconFile != undefined) return iconFile;
    else return parts[0];
  }

  static semboTypeStr(type) {
    if (type == 100) {
      return "Fire";
    }
    else if (type == 200) {
      return "Water";
    }
    else if (type == 300) {
      return "Grass";
    }
    return "N/A";
  }

  static timeStamp() {
    // Create a date object with the current time
      var now = new Date();
    
    // Create an array with the current month, day and time
      var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
    
    // Create an array with the current hour, minute and second
      var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
    
    // Determine AM or PM suffix based on the hour
      var suffix = ( time[0] < 12 ) ? "AM" : "PM";
    
    // Convert hour from military time
      time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
    
    // If hour is 0, set it to 12
      time[0] = time[0] || 12;
    
    // If seconds and minutes are less than 10, add a zero
      for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
          time[i] = "0" + time[i];
        }
      }
    
    // Return the formatted string
      return date.join("/") + " " + time.join(":") + " " + suffix;
  }

  static log(msg) {
    console.log(msg);
  }

  static error(msg) {
    console.log("SMB_Error:");
    console.log(msg);
  }

  static jumpTextInit() {
    $(".jumpTitle").lettering();
  }

  static jumpTextAnimate() {
    var title1 = new TimelineMax();
    title1.staggerFromTo(".jumpTitle span", 0.5, 
    {ease: Back.easeOut.config(1.7), opacity: 0, bottom: -80},
    {ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0}, 0.05);
  }

  static jumpTextAnimateOut() {
    var title1 = new TimelineMax();
    title1.staggerFromTo(".jumpTitle span", 0.5, 
    {ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0},
    {ease: Back.easeOut.config(1.7), opacity: 0, bottom: 60}, 0.05);
  }

  // ios fix: make div scrollable; elementId is the id of the PARENT of scrollable content.
  static scrollableContainer(elementId) {
    CFG.touchStart = null;
    CFG.scrollStart = null;
    CFG.isTouching = false;

    CFG.scrollCont = document.getElementById(elementId);
    $('#scrollBox').bind('touchstart', function(e) {
      CFG.isTouching = true;
      CFG.scrollStart = {x:CFG.scrollCont.scrollLeft, y:CFG.scrollCont.scrollTop};
      CFG.touchStart = {x:e.pageX, y:e.pageY};
    });
    $('#scrollBox').bind('touchend', function(e) {
      CFG.isTouching = false;
    });
    $('#scrollBox').bind('touchmove', function(e) {
      e.preventDefault();
      
      if (CFG.isTouching) {
        let v = CFG.scrollStart.y - ( e.pageY - CFG.touchStart.y ) / CFG.zoomRatio;
        CFG.scrollCont.scrollTop = v;
      }
    });
  }
}