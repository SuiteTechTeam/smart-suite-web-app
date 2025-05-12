import http from "../../shared/services/http-common.js";

export class NotificationsApiService {

  async getNotifications() {
    return http.get('/notifications');
  }
}