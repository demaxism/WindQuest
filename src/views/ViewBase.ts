import * as THREE from '../assets/js/three';
import * as Sembo from '../assets/class/sembo';
declare var THREE:any;
declare var CFG:any;
declare var Sembo:any;

export class ViewBase extends  (THREE.Scene as { new(): any; }) {

  protected container:HTMLElement;
  public camera:THREE.PerspectiveCamera;
  protected controls:THREE.OrbitControls;
  protected semboList:Array<any> = [];
  protected textureList:Array<any> = [];
  protected isClickSemboEnabled:boolean = true;

  constructor(container:HTMLElement) {
    super();

    this.container = container;
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
    this.container.addEventListener( 'click', this.onDocumentMouseUp, false );
  }

  // to be override
  semboClickAction(sembo:Sembo) {
    sembo.startAnim("hi");
  }

  onDocumentMouseUp(event) {
    if (!this.isClickSemboEnabled || !this.visible) return;
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
            this.semboClickAction(found);
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

  animate() {}

  disposeNode (node)
  {
    if (node instanceof THREE.Mesh)
    {
      if (node.geometry)
      {
        node.geometry.dispose ();
      }

      if (node.material)
      {
        if (node.material instanceof THREE.MeshFaceMaterial)
        {
          $.each (node.material.materials, function (idx, mtrl)
          {
            if (mtrl.map)           mtrl.map.dispose ();
            if (mtrl.lightMap)      mtrl.lightMap.dispose ();
            if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
            if (mtrl.normalMap)     mtrl.normalMap.dispose ();
            if (mtrl.specularMap)   mtrl.specularMap.dispose ();
            if (mtrl.envMap)        mtrl.envMap.dispose ();

            mtrl.dispose ();    // disposes any programs associated with the material
          });
        }
        else
        {
          if (node.material.map) {
            if (node.material.map.dispose instanceof Function) {
              node.material.map.dispose ();
            } 
          }          
          if (node.material.lightMap) {
            if (node.material.map.dispose instanceof Function) node.material.lightMap.dispose ();
          }    
          if (node.material.bumpMap) {
            if (node.material.map.dispose instanceof Function) node.material.bumpMap.dispose ();
          }     
          if (node.material.normalMap) {
            if (node.material.map.dispose instanceof Function) node.material.normalMap.dispose ();
          }   
          if (node.material.specularMap) {
            if (node.material.map.dispose instanceof Function) node.material.specularMap.dispose ();
          } 
          if (node.material.envMap) {
            if (node.material.map.dispose instanceof Function) node.material.envMap.dispose ();
          }

          if (node.material.dispose instanceof Function) {
            node.material.dispose ();   // disposes any programs associated with the material
            node.material = null;
          }
        }
      }
    }
  }   // disposeNode

  disposeHierarchy (node, callback) {
    for (let i = node.children.length - 1; i >= 0; i--)
    {
      let child = node.children[i];
      if (child.destroy instanceof Function) {
        child.destroy();
      }
      this.disposeHierarchy (child, callback);
      callback (child);
    }
  }

  destroy() {
    for (let i = 0; i < this.semboList.length; i++) {
        this.semboList[i].destroy();
    }
    this.semboList = null;
    this.disposeHierarchy(this, this.disposeNode);
    this.container.removeEventListener( 'click', this.onDocumentMouseUp);
    this.camera = null;
    if (this.controls != null) {
      this.controls.dispose();
      this.controls = null;
    }

    cancelAnimationFrame(this.id);
    this.animate = null;
  }
}