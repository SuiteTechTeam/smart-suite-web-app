import http from "../../../shared/services/http-common.js";

export class RoomControlApiService {

    getAll() {
        return http.get('/rooms');
    }

    create(room) {
        return http.post('/rooms', room);
    }

    update(id, room) {
        return http.put(`/rooms/${id}`, room);
    }

    delete(id) {
        return http.delete(`/rooms/${id}`);
    }
}