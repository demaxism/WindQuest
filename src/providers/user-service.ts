import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user';
import { VisitingPlace } from '../models/VisitingPlace';
import * as Util from '../assets/class/Util';
declare var CFG:any;
declare var Util:any;

@Injectable()
export class UserService {
    public user:User; // depricated. after fetchUserData will assign this
    public currentUser:any; // after setLocalCurrentUser(login); same as user object in users table of db, property sample:[username] "test003" [id] hashId
    public semboSpecCache:any;
    public partSpec:any;
    public landSpec:any;
    public activePlace:number = 0; // active place index
    public visitingPlace:VisitingPlace; // pass from sailView to visitView
    public selfSembo:any; // used in battle
    public enemySembo:any; // used in battle
    fileTransfer: FileTransferObject = this.transfer.create();

    constructor(
        private file: File,
        private transfer: FileTransfer,
        private http: HttpClient,
        private ionStorage: Storage
    ) { 
        this.user = new User();
        this.loadPartSpec();
    }

    private loadPartSpec() {
        let self = this;
        $.getJSON("assets/json/part_spec_all.json", function(json) {
            self.partSpec = json;
        });
        $.getJSON("assets/json/land_spec.json", function(json) {
            self.landSpec = json;
        });
    }

    public get activeSemboId():string {
      let currentPlaceData = this.currentUser.places[this.activePlace];
      let placeName = Object.keys(currentPlaceData)[0];
      return currentPlaceData[placeName];
    }

    public get activeLandId():string {
        let currentPlaceData = this.currentUser.places[this.activePlace];
        let placeName = Object.keys(currentPlaceData)[0];
        return placeName;
      }

    public getSemboById(semboId:string):any {
        return this.semboSpecCache.sembos[semboId];
    }

    // deprecated
    public fetchUserData(userId:string):Observable<any> {
        let self = this;
        let url = CFG.backEnd + "/api?method=get_user_data&user_id=" + userId;
        return this.http.get<any>(url)
        .pipe(
            tap(data => {
                // this is executed pirior to subscribe
                self.user.userId = data.user_data.username;
                self.user.ownedSembos = data.user_data.owned_sembos;
                self.user.serverName = data.serverName;
                Util.log('fetched user:' + data.info);
            }),
            catchError(Util.log('fetchUserData fail'))
        );
    }

    public getInitInfo() {
        let self = this;
        let url = CFG.backEnd + "/api?method=get_init_info";
        return this.http.get<any>(url)
        .pipe(
            tap(data => {
                self.semboSpecCache = data;
                self.semboSpecCache.partSpec = self.partSpec;
            })
        );
    }

    public getQuest(quest_id: string, user_id:string = undefined) {
        if (user_id == undefined) {
            user_id = this.currentUser.id;
        }
        return this.http.get(`${CFG.backEnd}/users/quest/` + quest_id + '/' + user_id);
    }

    public getLocalCurrentUser(callback:Function) {
        this.ionStorage.get('currentUser').then((val) => {
            if (val == null) {
              Util.log('No user info found in storage');
            }
            this.currentUser = JSON.parse(val);
            callback(this.currentUser);
        });
    }

    public updateCurrentUser(user) {
        this.currentUser.__v = user.__v;
        this.currentUser.owned_sembos = user.owned_sembos;
        this.currentUser.places = user.places;
    }

    public setLocalCurrentUser(user) {
        this.currentUser = user;
        this.currentUser.id = user._id;
        this.semboSpecCache = user.semboSpecData;
        this.semboSpecCache.partSpec = this.partSpec;
        this.currentUser.semboSpecData = null; // prevent store too long string in ionStorage
        this.ionStorage.set('currentUser', JSON.stringify(this.currentUser));
    }

    public clearLocalCurrentUser() {
        this.ionStorage.remove('currentUser');
        this.ionStorage.remove('currentPassword');
    }

    public getLocalPassword(callback:Function) {
        this.ionStorage.get('currentPassword').then((val) => {
            if (val == null) {
              Util.log('No password info found in storage');
            }
            callback(val);
        });
    }

    public setLocalPassword(str:string) {
        this.ionStorage.set('currentPassword', str);
    }

    private download(originUrl, filePath) {
        this.fileTransfer.download(originUrl, this.file.dataDirectory + filePath, true)
        .then(response => {
            Util.log("sembo thumbnail downloaded." + response.toURL());
        })
        .catch(err => {
            Util.log("sembo thumbnail downloaded failed.");
        });
    }

    public thumbnailUrl(semboId:string, callback:Function) {
        let self = this;
        let originUrl = CFG.backEnd + "/sembo_thumb/img_" + semboId + ".png";
        let filePath = 'downloads/img_' + semboId + ".png";

        // check file exist
        self.file.checkFile(self.file.dataDirectory, filePath)
        .then(response => {
            Util.log("sembo thumbnail exists." + filePath);
            let url = self.file.dataDirectory + filePath;
            callback(url.replace("file:///","/"));
        })
        .catch(err => {
            Util.log("sembo thumbnail not exist. download it.")
            self.download(originUrl, filePath);
            callback(originUrl);
        });
    }

    public cachedFileUrl(file:string, callback:Function) {
        let self = this;
        let originUrl = CFG.backEnd + "/remote_res/" + file;
        let filePath = 'downloads/' + file;

        // check file exist
        self.file.checkFile(self.file.dataDirectory, filePath)
        .then(response => {
            Util.log("cache file exists." + filePath);
            let url = self.file.dataDirectory + filePath;
            callback(url.replace("file:///","/"));
        })
        .catch(err => {
            Util.log("cache file not exist. download it.")
            self.download(originUrl, filePath);
            callback(originUrl);
        });
    }
}