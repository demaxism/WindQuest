import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../_models';
declare var CFG:any;

@Injectable()
export class AuthUserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<AuthUser[]>(`${CFG.backEnd}/users`);
    }

    getById(id: string) {
        return this.http.get(`${CFG.backEnd}/users/` + id);
    }

    register(user: AuthUser) {
        return this.http.post(`${CFG.backEnd}/users/register`, user);
    }

    registerSimple(user: AuthUser) {
        return this.http.post(`${CFG.backEnd}/users/registersimple`, user);
    }

    update(user: AuthUser) {
        return this.http.put(`${CFG.backEnd}/users/` + user.id, user);
    }

    updateUser(user: any) {
        return this.http.put(`${CFG.backEnd}/users/ud/` + user.id, user);
    }

    delete(id: number) {
        return this.http.delete(`${CFG.backEnd}/users/` + id);
    }
}