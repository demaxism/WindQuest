import { UserService } from '../providers/user-service';
import * as THREE from '../assets/js/three';
declare var THREE:any;
declare var Sembo:any;

class LandSpec {
  landId:string;
  posMain:number[];
  posGuest:number[];
}

export class Land extends  (THREE.Group as { new(): any; }) {

  private landSpec:LandSpec;
  private userService:UserService;
  public posMain:any;
  public posGuest:any;

  constructor(landId:string, userService:UserService, callBack:Function) {
    super();

    this.userService = userService;
    this.landSpec = this.userService.landSpec[landId];

    let _posMain = this.landSpec.posMain;
    this.posMain = {x:_posMain[0], y:_posMain[2], z:-_posMain[1]};
    let _posGuest = this.landSpec.posGuest;
    this.posGuest = {x:_posGuest[0], y:_posGuest[2], z:-_posGuest[1]};

    let self = this;

    let loader = new THREE.FBXLoader();
    let path = "assets/land/" + landId + ".fbx";
    loader.load(path, function (object) {
      object.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = true;
        }
      });
      self.add(object);
      callBack(self);
    });
  }
}