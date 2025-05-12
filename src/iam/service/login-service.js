import http from "../../shared/services/http-common.js";
import {User} from "../model/user.entity.js";

export class LoginService {

    getAllUsers() {
        return http.get('/users');
    }

    getUser(id) {
        return http.get(`/users/${id}`);
    }

    getLocalUser() {
        let id = localStorage.getItem('id');
        return this.getUser(id);
    }

    getUserFromResponse(response) {
        return new User(
            response.id,
            response.name,
            response.password,
            response.email,
            response.company,
            response.role
        );
    }
}