import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserService } from '../../providers/user-service';
declare var CFG:any;

@Injectable()
export class AuthenticationService {
    constructor(
        private http: HttpClient,
        private userService: UserService
        ) { }

    login(username: string, password: string) {
        let self = this;
        return this.http.post<any>(`${CFG.backEnd}/users/authenticate`, { username: username, password: password })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    self.userService.setLocalCurrentUser(user);
                    self.userService.setLocalPassword(password);
                }

                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        this.userService.clearLocalCurrentUser();
    }
}