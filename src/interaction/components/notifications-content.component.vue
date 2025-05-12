<script>
import {NotificationsApiService} from "../services/notifications-api.service.js";
import {Notification} from "../models/notification.entity.js";
import NotificationTable from "./notification-table.component.vue";

export default {
  name: "notifications-content",
  components: {NotificationTable},
  data() {
    return {
      notifications: [],
      notificationsApi: new NotificationsApiService(),
      columnsDefined: []
    }
  },
  created() {
     this.initConfiguration()
  },
  methods: {
     initConfiguration() {
      this.notificationsApi.getNotifications().then(response => {
        this.columnsDefined = ["id", 'title', 'message', 'date'];
        this.notifications = this.buildNotificationsListFromResponse(response.data)
      });
    },

    buildNotificationsListFromResponse(response) {
      return response.map(item => new Notification(item['id'], item['title'], item['message'], item['date']));
    }
  }
}
</script>

<template>
  <notification-table :columns="columnsDefined" :items="notifications"></notification-table>
</template>

<style scoped>

</style>