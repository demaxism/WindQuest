class DemoView extends THREE.Scene {

  constructor(container, renderer, userService) {
    super();

    this.userService = userService;
    this.user = (userService) ? userService.user : null;
    this.container = container; // Dom
    this.renderer = renderer;
    this.camera;
    this.demoSembo;
    this.currentSemboId;
    let self = this;

    // Camera
    this.camera = new THREE.PerspectiveCamera( 35, this.renderer.getSize().width / this.renderer.getSize().height, 1, 2000 );
    let farth = 8; // bigger smaller
    let viewHeight = 0; // bigger image lower
    this.camera.position.set( 0, viewHeight, farth );

    // Light
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
    this.add( ambientLight );
    var light1 = new THREE.DirectionalLight( 0xffffff, 0.2 );
    light1.position.set( 0, -20, 10 );
    this.add( light1 );
    var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
    light2.position.set( 0, 0, 1 ).normalize();
    this.add( light2 );

    this.animate = this.animate.bind(this);
    this.animate();

    this.on_EVT_DEMO_SEMBO = function(event) {
      self.container.style.display = "block";
      self.loadSembo(event.semboId);
    }
    eventHub.addEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);

    this.on_EVT_BtnDemoSave = function(event) {
      self.capture();
      self.removeSembo();
      eventHub.dispatchEvent({type:"EVT_ADD_BREED", semboId:self.currentSemboId}); 
    };
    eventHub.addEventListener("EVT_BtnDemoSave", this.on_EVT_BtnDemoSave);

    this.on_EVT_BtnDemoDiscard = function(event) {
      let url = CFG.backEnd + "/api?method=delete_sembo&semboId=" + self.currentSemboId;
      $.get(url, function(data) {
          console.log(data);
          self.removeSembo();
          eventHub.dispatchEvent({type:"EVT_DISCARD_BREED", semboId:self.currentSemboId}); 
      });
    };
    eventHub.addEventListener("EVT_BtnDemoDiscard", this.on_EVT_BtnDemoDiscard);
  }

  capture() {
    let canvas = document.getElementById("demoBox3d"); 
    let image = canvas.toDataURL();
    image = image.replace(/^data:image\/\w+;base64,/, "");

    $.post(CFG.backEnd + "/api?method=save_data&semboId=" + this.currentSemboId + "&userId=" + this.user.userId, {data: image}, function(result){
        let a = result;
    });
  }

  removeSembo() {
    if (this.demoSembo != null) {
      this.remove(this.demoSembo);
      this.demoSembo.destroy();
      this.demoSembo = null;
      this.container.style.display = "none";
    }
  }

  loadSembo(semboId) {
    this.currentSemboId = semboId;
    let self = this;
    if (this.demoSembo != null) {
      this.remove(this.demoSembo);
    }
    this.demoSembo = new Sembo(semboId, function(){
        self.arrangeSembo();
        eventHub.dispatchEvent({type:"EVT_DEMO_SEMBO_LOADED"}); 
      }, this.userService.semboSpecCache);
    this.add(this.demoSembo);
    this.demoSembo.visible = false;
  }

  arrangeSembo() {
    this.demoSembo.rotation.x = Math.PI / 8;
    this.demoSembo.rotation.y = - Math.PI / 8;
    let dimMax = Math.max(this.demoSembo.dimension.x, this.demoSembo.dimension.y, this.demoSembo.dimension.z);
    let baseDim = 3.8; // bear's dim is 3.8, larger than bear, scale down; smaller than bear, no scale
    let slope = 0.4; // bigger, scale down more; smaller, scale down less
    let scaleFactor = Math.pow(Math.min(baseDim / dimMax, 1), slope);
    this.demoSembo.position.set(0, -this.demoSembo.dimension.y / 2, -this.demoSembo.dimension.z / 2);
    this.demoSembo.visible = true;

    // zoom in sembo
    let self = this;
    let posVar = {s:0};
    let posTo = {s: scaleFactor};
    let onUpdate = function () {
      self.demoSembo.scale.set( posVar.s, posVar.s, posVar.s );
    }
    let tween = new TWEEN.Tween(posVar)
    .onUpdate(onUpdate)
    .easing(TWEEN.Easing.Linear.None).to(posTo, 1000).start();
  }

  animate() {
    requestAnimationFrame( this.animate );
    this.renderer.render( this, this.camera );
  }

  destroy() {
    if (this.demoSembo != null) {
      this.demoSembo.destroy();
      this.demoSembo = null;
    }
    eventHub.removeEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);
    eventHub.removeEventListener("EVT_BtnDemoSave", this.on_EVT_BtnDemoSave);
    eventHub.removeEventListener("EVT_BtnDemoDiscard", this.on_EVT_BtnDemoDiscard);
  }
}