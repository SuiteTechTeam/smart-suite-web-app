<script>
import {NotificationsApiService} from "../services/notifications-api.service.js";
import {Notification} from "../models/notification.entity.js";
import NotificationTableComponent from "../components/notification-table.component.vue";
import NotificationTable from "../components/notification-table.component.vue";
export default {
  name: "notification-management",
  components: {NotificationTable, NotificationTableComponent},
  data(){
    return {
      notifications: [],
      columns: [],
      notificationService: null,
      title: {singular: 'Notification', plural: 'Notifications'}
    }
  },
  created(){
    this.notificationService = new NotificationsApiService();
    this.columns = ['id', 'title', 'message', 'date'];
    this.notificationService.getNotifications().then(response => {
      this.notifications = this.buildNotificationsListFromResponse(response);
      console.log(this.notifications);
    });
  },
  methods:{
    buildNotificationsListFromResponse(response){
      return response.map(item => new Notification(item['id'], item['title'], item['message'], item['date']));
    }
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Notification Data Manager -->
    <notification-table
        v-bind:items="notifications"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :columns="columns"
        title="title">
        <template #notification-columns>
          <pv-column :sortable="true" field="id" header="ID"></pv-column>
          <pv-column :sortable="true" field="title" header="TITLE"></pv-column>
          <pv-column :sortable="true" field="message" header="MESSAGE"></pv-column>
          <pv-column :sortable="true" field="date" header="DATE"></pv-column>
        </template>
    </notification-table>
  </div>
</template>
