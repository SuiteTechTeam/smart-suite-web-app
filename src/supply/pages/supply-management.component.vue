<script>
import {Supply} from "../models/supply.entity.js";
import {SupplyControlApiService} from "../services/supply-control-api.service.js";
import DataManager from "../../shared/components/data-manager.component.vue";
import SupplyItemCreateAndEditDialog from "../components/supply-item-create-and-edit-dialog.component.vue";
import {props} from "@syncfusion/ej2-vue-navigations/src/treeview/treeview.component.js";

export default {
  name: "supply-management",
  components: {SupplyItemCreateAndEditDialog, DataManager},
  data(){
    return {
      title: {singular: 'Supply', plural: 'Supplies'},
      supplies: [],
      supply: {},
      selectedSupplies: [],
      supplyControlService: null,
      createAndEditDialogIsVisible: false,
      isEdit: false,
      submitted: false,
      searchValue: ''
    }
  },
  methods: {
    props() {
      return props
    },
    //#region Helper Methods
    notifySuccessfulAction(message) {
      this.$toast.add({severity: "success", summary: this.$t('notifSupply.success') , detail: message, life: 3000,});
    },
    findIndexById(id) {
      return this.supplies.findIndex((supply) => supply.id === id);
    },

    //#region Data Manager Event Handlers
    onNewItemEventHandler() {
      this.supply = {};
      this.submitted = false;
      this.isEdit = false;
      this.createAndEditDialogIsVisible = true;
    },
    onEditItemEventHandler(item) {
      this.supply = item;
      this.submitted = false;
      this.isEdit = true;
      this.createAndEditDialogIsVisible = true;
    },
    onDeleteItemEventHandler(item) {
      this.supply = item;
      this.deleteSupply();
    },


    //#region Tutorial Item Create and Edit Dialog Event Handlers
    onCanceledEventHandler() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },
    onSavedEventHandler(item) {
      this.submitted = true;
      if (this.validateForm()) {
        if (item.id) {
          this.updateSupply();
        } else {
          this.createSupply();
        }
      }
      this.createAndEditDialogIsVisible = false;
      this.isEdit = false;
    },

    handleError(error) {
      this.$toast.add({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    },

    //#region Data Actions
    // Create a new item
    createSupply() {
      this.supply.id = 0;
      this.supply = Supply.fromDisplayableSupply(this.supply);
      this.supplyControlService.create(this.supply)
          .then((response) => {

            this.supply = Supply.fromDisplayableSupply(response.data);
            this.supplies.push(this.supply);
            this.notifySuccessfulAction(this.$t('notifSupply.created'));
          })
          .catch(this.handleError);
    },
    // Update an existing item
    updateSupply() {

      this.supply = Supply.fromDisplayableSupply(this.supply);
      this.supplyControlService
          .update(this.supply.id, this.supply)
          .then((response) => {
            this.supplies[this.findIndexById(response.data.id)] =
                Supply.fromDisplayableSupply(response.data);
            this.notifySuccessfulAction(this.$t('notifSupply.updated'));
          })
          .catch(this.handleError);
    },
    // Delete a item
    deleteSupply() {
      this.supplyControlService.delete(this.supply.id)
          .then(() => {
            this.supplies = this.supplies.filter((s) => s.id !== this.supply.id);
            this.supply = {};

            this.notifySuccessfulAction(this.$t('notifSupply.deleted'));
          });
    },
    // Search function
    search() {
      if (this.searchValue) {
        this.supplies = this.supplies.filter(supply =>
            supply.product.toLowerCase().includes(this.searchValue.toLowerCase()) ||
            supply.id.toString().includes(this.searchValue)
        );
      } else {
        this.supplyControlService.getAll().then((response) => {
          this.supplies = response.data.map((supply) => Supply.fromDisplayableSupply(supply));
        });
      }
    },
    // Validate information
    validateForm() {
      if (
          !(this.supply.product && this.supply.product.trim()) ||
          !this.supply.quantity ||
          !(this.supply.address && this.supply.address.trim()) ||
          !(this.supply.expire)
      ) {
        this.$toast.add({severity: "warn", summary: this.$t('notifSupply.warning'), detail: this.$t('notifSupply.fields-required'), life: 3000,});
        return false;
      }
      return true;
    },
  },
  created() {
    this.supplyControlService = new SupplyControlApiService();

    this.supplyControlService.getAll().then((response) => {
      this.supplies = response.data.map((supply) => Supply.fromDisplayableSupply(supply));
    });
  }
}
</script>

<template>
  <div class="w-full">
    <!-- Tutorial Data Manager -->
    <data-manager
        :title=title
        v-bind:items="supplies"
        v-on:new-item="onNewItemEventHandler"
        v-on:edit-item="onEditItemEventHandler($event)"
        v-on:delete-item="onDeleteItemEventHandler($event)">
      <template #custom-columns>
        <div class="search">
          <input type="text" v-model="searchValue" @input="search" :placeholder="$t('supply.search')">
        </div>
        <div class="table-responsive">
          <pv-column :sortable="true" field="id" header="ID" style="min-width: 12rem"/>
          <pv-column :sortable="true" field="product" :header="$t('supply.product')" style="min-width: 16rem"/>
          <pv-column :sortable="true" field="quantity" :header="$t('supply.quantity')" style="min-width: 16rem"/>
          <pv-column :sortable="true" field="address" :header="$t('supply.address')" style="min-width: 16rem"/>
          <pv-column :sortable="true" field="expire" :header="$t('supply.expire')" style="min-width: 16rem">
            <template #body = "{data}">
              {{ new Date(data.expire).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }) }}
            </template>
          </pv-column>
        </div>
      </template>
    </data-manager>
    <!-- Tutorial Item Create and Edit Dialog -->
    <supply-item-create-and-edit-dialog
        :item="supply"
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

.table-responsive {
  display: flex;
  flex-direction: column;
  width: 20%;
  margin: auto;
  overflow-x: auto;
}

.search {
  display: flex;
  height: 2rem;
  width: 100%;
  margin-left: 10px;
  margin-bottom: 1rem;
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