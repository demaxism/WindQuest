import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { AuthUser } from '../_models';
import { AuthUserService } from '../_services';

@Component({templateUrl: 'home.component.html'})
export class AuthHomeComponent implements OnInit {
    currentUser: AuthUser = new AuthUser();
    users: AuthUser[] = [];

    constructor(
        private authUserService: AuthUserService,
        private ionStorage: Storage
    ) {
        let self = this;
        this.ionStorage.get('currentUser').then((val) => {
            if (val != null) {
                self.currentUser = JSON.parse(val);
            }
            else {
                console.log('not logged in');
            }
        });
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(id: number) {
        this.authUserService.delete(id).pipe(first()).subscribe(() => { 
            this.loadAllUsers() 
        });
    }

    private loadAllUsers() {
        this.authUserService.getAll().pipe(first()).subscribe(users => { 
            this.users = users; 
        });
    }

    onLogout() {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "Login"}));
    }

    onEntry() {
        window.dispatchEvent(new CustomEvent("EVT_ROUTE_VIEW", {detail: "EntryPage"}));
    }
}