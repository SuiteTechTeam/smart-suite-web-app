<script>

import RoomItemCreateAndEditDialog from "../components/room-item-create-and-edit-dialog.component.vue";
import {RoomControlApiService} from "../services/room-control-api.service.js";
import {Room} from "../model/room.entity.js";
import DataManager from "../../../shared/components/data-manager.component.vue";

export default {
  name: "room-management",
  components: {RoomItemCreateAndEditDialog, DataManager},
  data() {
    return {
      title: { singular: 'Room', plural: 'Rooms' },
      rooms: [],
      room: { },
      selectedRooms: [],
      statuses: [{label: 'Not Busy', value: 'not busy'}, {label: 'Busy', value: 'busy'}],
      roomControlService: null,
      createAndEditDialogIsVisible: false,
      isEdit: false,
      submitted: false
    }
  },
  methods: {

    validateFields(room) {
      try {
        if ((room.name !== undefined && room.name.toString().trim() !== '') &&
            (room.description !== undefined && room.description.toString().trim() !== '') &&
            (room.price !== undefined) &&
            (room.worker !== undefined && room.worker.toString().trim() !== '') &&
            (room.client !== undefined && room.client.toString().trim() !== '') &&
            (room.totalBeds !== undefined) &&
            (room.totalBathrooms !== undefined) &&
            (room.totalTelevision !== undefined) &&
            (room.status.value !== undefined)) {
          return true;
        } else {
          return false;
        }
      }
      catch(error) {
        return false;
      }
    },

    notifySuccessfulAction(message) {
      this.$toast.add({severity: "success", summary: "Success", detail: message, life: 3000,});
    },

    getSeverity(status) {
      switch (status) {
        case 'Busy': return 'success';
        case 'Bot Busy': return 'info';
        default:  return null;
      }
    },

    findIndexById(id) {
      return this.rooms.findIndex((room) => room.id === id);
    },

    onNewItemEventHandler() {
      this.room = { };
      this.submitted = false;
      this.isEdit = false;
      this.createAndEditDialogIsVisible = true;
    },

    onEditItemEventHandler(item) {
      this.room = item;
      this.submitted = false;
      this.isEdit = true;
      this.createAndEditDialogIsVisible = true;
    },

    onDeleteItemEventHandler(item) {
      this.room = item;
      this.deleteRoom();
    },

    onDeleteSelectedItemsEventHandler(selectedItems) {
      this.selectedRooms = selectedItems;
      this.deleteSelectedRooms();
    },

    onCanceledEventHandler() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },

    onSavedEventHandler(item) {
      this.submitted = true;

      if (this.validateFields(item) === true && this.room.name.trim()) {
        if (item.id) {
          this.updateRoom();
        } else {
          this.createRoom();
        }
      }
      else {

        alert('Enter the data correctly');
      }
      this.createAndEditDialogIsVisible = false;
      this.isEdit = false;
    },

    createRoom() {
      this.room.id = 0;
      this.room = Room.fromDisplayableRoom(this.room);

      this.roomControlService.create(this.room)
          .then((response) => {

            this.room = Room.toDisplayableRoom(response.data);
            this.rooms.push(this.room);
            this.notifySuccessfulAction("Room Created");
          });
    },

    updateRoom() {

      this.room = Room.fromDisplayableRoom(this.room);
      this.roomControlService
          .update(this.room.id, this.room)
          .then((response) => {

            this.rooms[this.findIndexById(response.data.id)] =
                Room.toDisplayableRoom(response.data);

            this.notifySuccessfulAction("Room Updated");
          });
    },

    deleteRoom() {

      this.roomControlService.delete(this.room.id)
          .then(() => {
            this.rooms = this.rooms.filter((r) => r.id !== this.room.id);
            this.room = {};

            this.notifySuccessfulAction("Room Deleted");
          });
    },

    deleteSelectedRooms() {
      this.selectedRooms.forEach((room) => {
        this.roomControlService.delete(room.id).then(() => {
          this.rooms = this.rooms.filter((r) => r.id !== this.room.id);
        });
      });

      this.notifySuccessfulAction("Rooms Deleted");
    }
  },
  created() {
    this.roomControlService = new RoomControlApiService();

    this.roomControlService.getAll().then((response) => {
      this.rooms = response.data.map((room) => Room.toDisplayableRoom(room));
    });
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Tutorial Data Manager -->
    <data-manager
        :title=title
        v-bind:items="rooms"
        v-on:new-item="onNewItemEventHandler"
        v-on:edit-item="onEditItemEventHandler($event)">
      <template #custom-columns>

        <pv-column :sortable="true" field="id" style="min-width: 12rem">
          <template #header>
            {{ $t("rooms-monitoring.view.id") }}
          </template>
        </pv-column>
        <pv-column :sortable="true" field="name" style="min-width: 16rem">
          <template #header>
            {{ $t("rooms-monitoring.view.name") }}
          </template>
        </pv-column>
        <pv-column :sortable="true" field="description"     header="Description"     style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="price"           header="Price"           style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="worker" style="min-width: 16rem">
          <template #header>
            {{ $t("rooms-monitoring.view.worker") }}
          </template>
        </pv-column>
        <pv-column :sortable="true" field="client" style="min-width: 16rem">
          <template #header>
            {{ $t("rooms-monitoring.view.client") }}
          </template>
        </pv-column>
        <pv-column :sortable="true" field="totalBeds"       header="TotalBeds"       style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="totalBathrooms"  header="TotalBathrooms"  style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="totalTelevision" header="TotalTelevision" style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="totalBeds"       header="TotalBeds"       style="min-width: 16rem; display:none"/>
        <pv-column :sortable="true" field="status" style="min-width: 16rem">
          <template #header>
            {{ $t("rooms-monitoring.view.status") }}
          </template>
          <template #body="slotProps">
            <pv-tag :severity="getSeverity(slotProps.data.status)" :value="slotProps.data.status"/>
          </template>
        </pv-column>
      </template>
    </data-manager>
    <!-- Tutorial Item Create and Edit Dialog -->
    <room-item-create-and-edit-dialog
        :statuses="statuses"
        :item="room"
        :edit="isEdit"
        :visible="createAndEditDialogIsVisible"
        v-on:canceled="onCanceledEventHandler"
        v-on:saved="onSavedEventHandler($event)"/>

  </div>

</template>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media screen and (max-width: 960px) {
  :deep(.p-toolbar) {
    flex-wrap: wrap;

  }
}

@media (min-width: 1024px) {
  .tutorials {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>