import http from "../../shared/services/http-common.js";

export class SupplyControlApiService {

    getAll() {
        return http.get('/supplies');
    }

    create(supply) {
        return http.post('/supplies', supply);
    }

    update(id, supply) {
        return http.put(`/supplies/${id}`, supply);
    }

    delete(id) {
        return http.delete(`/supplies/${id}`);
    }
}