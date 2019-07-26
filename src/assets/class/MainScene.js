class MainScene extends THREE.Scene {

    constructor(container, userService, renderer) {
        super();

        this.renderer = renderer;
        this.user = (userService) ? userService.user : null;
        this.semboSpecCache = userService.semboSpecCache;
        this.container = container; // Dom
        this.camera;
        this.semboList = [];
        this.controls;
        this.delta = 0.016;
        this.tick = 0;
        this.emitter;
        this.innerSphere;
        let self = this;

        // Camera
        this.camera = new THREE.PerspectiveCamera( 35, this.container.clientWidth / this.container.clientHeight, 1, 2000 );
        let farth = 3;
        this.camera.position.set( 1 * farth, 2 * farth, 8 * farth );

        this.controls = new THREE.OrbitControls( this.camera );
        this.controls.target.set( 0, 1, 0 );
        Object.assign(this.controls, {
            enableDamping : true,
            dampingFactor : 0.1,
            rotateSpeed : 0.04,
            zoomSpeed : 0.5,
            minDistance: 10,
            maxDistance: 50,
            minPolarAngle: 30 * Math.PI / 180,
            maxPolarAngle: 88 * Math.PI / 180
        });
        this.controls.update();

        // Light
        this.background = new THREE.Color( 0xa0a0a0 );
        var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
        this.add( ambientLight );
        var light1 = new THREE.DirectionalLight( 0xffffff, 0.2 );
        light1.position.set( 0, 20, 10 );
        light1.castShadow = true;
        light1.shadow.camera.top = 18;
        light1.shadow.camera.bottom = -10;
        light1.shadow.camera.left = -12;
        light1.shadow.camera.right = 12;
        light1.shadow.mapSize.width = 512;
        light1.shadow.mapSize.height = 512;
        this.add( light1 );
        var light2 = new THREE.DirectionalLight( 0xffffff, 0.4 );
        light2.position.set( 0, 0, 1 ).normalize();
        this.add( light2 );

        let loader = new THREE.FBXLoader();
        loader.load('assets/land/land_A01.fbx', function (object) { // 'assets/land/land_A01.fbx'
            object.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = true;
                }
            });
            object.position.set(0, 0, 0);
            self.add(object);
        });

        // main
        let semboId1 = "A_sdRabbit"; // A_py002_haima A_py004_fish
        if (this.user.demoSembo1 != undefined) semboId1 = this.user.demoSembo1;
        this.addSembo(semboId1, -2, 0);
        let semboId2 = "A_py002_haima"; // A_py001teddy A_py003_bird A_py004_fish A_sdRabbit A_crab
        if (this.user.demoSembo2 != undefined) semboId2 = this.user.demoSembo2;
        this.addSembo(semboId2, 2, 0);

        this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
        this.animate = this.animate.bind(this);
        this.container.addEventListener( 'click', this.onDocumentMouseUp, false );
        this.animate();

        var imgTexture = new THREE.TextureLoader().load( "assets/imgs/pattern/vortex.png" );
        imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
        imgTexture.anisotropy = 16;

        // render target
        this.renderTarget = new THREE.WebGLRenderTarget(250, 250, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

        this.rtCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000);
        this.rtCamera.position.set( 0, 0, 8 );

        this.rtScene = new THREE.Scene();
        this.rtScene.background = new THREE.Color('red');
        let _ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
        this.rtScene.add( _ambientLight );

        var _geometry = new THREE.SphereGeometry( 3, 16, 16 );
        var _material = new THREE.MeshPhongMaterial( {
            map: imgTexture
        } );
        this.innerSphere = new THREE.Mesh( _geometry, _material );
        this.rtScene.add( this.innerSphere );

        // test
        var reflectionCube = new THREE.CubeTextureLoader()
					.setPath( 'assets/imgs/waterbox/' )
					.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
                reflectionCube.format = THREE.RGBFormat;

        var bumpScale = 1;
        var geometry = new THREE.PlaneBufferGeometry( 4, 4, 20, 16 );
        // basic monochromatic energy preservation
        let alpha = 0.8;
        let beta = 0.7;
        let gamma = 0.8;
        var specularShininess = Math.pow( 2, alpha * 10 );
        var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
        var diffuseColor = new THREE.Color(0xff55aa);
        this.material = new THREE.MeshPhongMaterial({
            map: this.renderTarget.texture
            //map:imgTexture
        });
        this.ball1 = new THREE.Mesh( geometry, this.material );
        this.add(this.ball1);
        this.ball1.position.set(3, 3, -3);

        // test 2
        var imgFire = new THREE.TextureLoader().load( "assets/imgs/pattern/lava.png" );
        imgFire.wrapS = imgFire.wrapT = THREE.RepeatWrapping;
        imgFire.anisotropy = 16;
        var mt2 = new THREE.MeshPhongMaterial( {
            map: imgFire,
            //color: new THREE.Color(0xffffff),
            emissive: new THREE.Color(0xff762b),
            emissiveIntensity: 0.3,
        } );
        this.ball2 = new THREE.Mesh( geometry, mt2 );
        this.add(this.ball2);
        this.ball2.position.set(-3, 3, -3);

        // fireworks
        let tex = new THREE.TextureLoader().load( 'assets/imgs/pattern/sparkle.png' );
        this.options = {
            position: new THREE.Vector3(0, 4, 0),
            positionRandomness: 1.4,
            velocity: new THREE.Vector3(),
            velocityRandomness: .3,
            color: 0x6688ff,
            colorRandomness: .5,
            turbulence: .0,
            lifetime: 0.6,
            size: 58,
            sizeRandomness: 1
        };
        this.particleSys = new THREE.GPUParticleSystem( { maxParticles: 2500, particleSpriteTex: tex } );
        this.add(this.particleSys);


        // breed
        this.on_EVT_BREED = function(event) {
            if (self.semboList.length >= 3) return;

            let url = CFG.backEnd + "/api?method=breed&id1=" + semboId1 + "&id2=" + semboId2;
            $.get(url, function(data) {
                console.log(data);
                eventHub.dispatchEvent({type:"EVT_DEMO_SEMBO", semboId:data.semboId});
            });
        }
        eventHub.addEventListener("EVT_BREED", this.on_EVT_BREED);

        this.on_EVT_DEMO_SEMBO = function(event) {
            self.container.style.display = "none";
            self.controls.enabled = false;
        }
        eventHub.addEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);

        this.on_EVT_DISCARD_BREED = function(event) {
            self.container.style.display = "block";
            self.controls.enabled = true;
        }
        eventHub.addEventListener("EVT_DISCARD_BREED", this.on_EVT_DISCARD_BREED);

        this.on_EVT_ADD_BREED = function(event) {
            self.container.style.display = "block";
            self.controls.enabled = true;
            self.addSembo(event.semboId, 0, 2);
        }
        eventHub.addEventListener("EVT_ADD_BREED", this.on_EVT_ADD_BREED);

        this.on_EVT_REMOVE_LAST = function(event) {
            console.log(event.data);
            self.removeLatestAddedSembo();
        }
        eventHub.addEventListener("EVT_REMOVE_LAST", this.on_EVT_REMOVE_LAST);
    }

    addSembo(semboId, x, z) {
        let sembo = new Sembo(semboId, null, this.semboSpecCache);
        console.log(Util.timeStamp());
        console.log("add sembo " + semboId);
        sembo.position.set(x, 0, z);
        this.add(sembo);
        this.semboList.push(sembo);
    }

    removeLatestAddedSembo() {
        let latestAddedSembo = this.semboList.pop();
        this.remove(latestAddedSembo);
        latestAddedSembo.destroy();
        latestAddedSembo = null;
    }

    onDocumentMouseUp(event) {
        console.log("onMouseUp");
        event.preventDefault();
    
        // Example of mesh selection/pick:
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        let posX = event.clientX / CFG.zoomRatio - this.container.offsetLeft - CFG.gapX;
        let posY = event.clientY / CFG.zoomRatio - this.container.offsetTop - CFG.gapY
        mouse.x = (posX / this.container.clientWidth) * 2 - 1;
        mouse.y = - (posY / this.container.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
    
        var objs/* THREE.Object3D[] */ = [];
        this.findAllObjects(objs, this);
        var intersects = raycaster.intersectObjects(objs);
        console.log("Scene has " + objs.length + " objects");
        console.log(intersects.length + " intersected objects found")

        for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            if (obj.semboId != undefined) {
                console.log(obj.semboId);
                let found = this.findSembo(obj.semboId);
                if (found != undefined) {
                    found.startAnim("hi");
                }
                break;
            }
        }
    }

    findSembo(semboId) {
        for (let i = 0; i < this.semboList.length; i++) {
            if (this.semboList[i].semboId === semboId) {
                return this.semboList[i];
            }
        }
        return undefined;
    }

    findAllObjects(pred /* THREE.Object3D[] */, parent /*THREE.Object3D*/ ) {
        // NOTE: Better to keep separate array of selected objects
        if (parent.children.length > 0) {
            parent.children.forEach((i) => {
                pred.push(i);
                this.findAllObjects(pred, i);
            });
        }
    }

    animate() {
        requestAnimationFrame( this.animate );
        this.controls.update();
        this.tick += this.delta;
        if (this.particleSys != null) {
            for (let i = 0; i < 3; i++) {
                this.particleSys.spawnParticle( this.options );
            }
            this.particleSys.update(this.tick);
        }

        if (this.ball1 != undefined) {
            this.ball1.rotation.z -= 0.03;
        }

        if (this.innerSphere != undefined) {
            this.innerSphere.rotation.y -= 0.04;
        }

        // render target
        this.renderer.render(this.rtScene, this.rtCamera, this.renderTarget);
        // render scene
        this.renderer.render( this, this.camera );
    }

    destroy() {
        for (let i = 0; i < this.semboList.length; i++) {
            this.semboList[i].destroy();
        }
        this.semboList = null;
        for( var i = this.children.length - 1; i >= 0; i--) {
            let obj = this.children[i];
            this.remove(obj);
        }
        this.controls.dispose();

        eventHub.removeEventListener("EVT_BREED", this.on_EVT_BREED);
        eventHub.removeEventListener("EVT_DEMO_SEMBO", this.on_EVT_DEMO_SEMBO);
        eventHub.removeEventListener("EVT_DISCARD_BREED", this.on_EVT_DISCARD_BREED);
        eventHub.removeEventListener("EVT_ADD_BREED", this.on_EVT_ADD_BREED);
        eventHub.removeEventListener("EVT_REMOVE_LAST", this.on_EVT_REMOVE_LAST);
    }
}