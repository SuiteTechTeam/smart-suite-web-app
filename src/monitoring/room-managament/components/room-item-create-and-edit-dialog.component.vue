<script>

import CreateAndEdit from "../../../shared/components/create-and-edit.component.vue";

export default {
  name: "room-item-create-and-edit-dialog",
  components: { CreateAndEdit },
  props: {
    item: null,
    visible: Boolean,
    statuses: Array
  },
  data() {
    return {
      submitted: false
    }
  },
  methods: {
    getSeverity(status) {
      switch (status) {
        case 'Busy':
          return 'warning';
        case 'Not Busy':
          return 'success';
        default:
          return null;
      }
    },

    canceledEventHandler() {
      this.$emit('canceled');
    },

    savedEventHandler() {
    }
  }
}
</script>

<template>
  <create-and-edit :entity="item" :visible="visible" entityName="Rooms" @canceled="canceledEventHandler"
                   @saved="savedEventHandler">
    <template #content>
      <div class="p-fluid">

        <div class="field mt-5">
          <pv-float-label>
            <label for="name">Name</label>
            <pv-input-text id="name" v-model="item.name" :class="{'p-invalid': submitted && !item.name}" required/>
            <small v-if="submitted && !item.name" class="p-invalid">Name is required.</small>
          </pv-float-label>
        </div>

        <div class="field mt-5">
          <pv-float-label>
            <label for="description">Description</label>
            <pv-input-text id="description" v-model="item.description" :class="{'p-invalid': submitted && !item.description}" required />
            <small v-if="submitted && !item.description" class="p-invalid">Description is required.</small>
          </pv-float-label>
        </div>

        <div class="field mt-5">
          <pv-float-label>
            <label for="price">Price</label>
            <pv-input-number id="price" v-model="item.price" :class="{'p-invalid': submitted && !item.price}" required />
            <small v-if="submitted && !item.price" class="p-invalid">Price is required.</small>
          </pv-float-label>
        </div>
        <div class="field mt-5">
          <pv-float-label>
            <label for="worker">Worker</label>
            <pv-input-text id="worker" v-model="item.worker" :class="{'p-invalid': submitted && !item.worker}" required />
            <small v-if="submitted && !item.worker" class="p-invalid">Worker is required.</small>
          </pv-float-label>
        </div>
        <div class="field mt-5">
          <pv-float-label>
            <label for="client">Client</label>
            <pv-input-text id="client" v-model="item.client" :class="{'p-invalid': submitted && !item.client}" required />
            <small v-if="submitted && !item.client" class="p-invalid">Client is required.</small>
          </pv-float-label>
        </div>
        <div class="field mt-5">
          <pv-float-label>
            <label for="totalBeds">Total Beds</label>
            <pv-input-number id="totalBeds" v-model="item.totalBeds" :class="{'p-invalid': submitted && !item.totalBeds}" required />
            <small v-if="submitted && !item.totalBeds" class="p-invalid">Total Beds is required.</small>
          </pv-float-label>
        </div>
        <div class="field mt-5">
          <pv-float-label>
            <label for="totalBathrooms">Total Bathrooms</label>
            <pv-input-number id="totalBathrooms" v-model="item.totalBathrooms" :class="{'p-invalid': submitted && !item.totalBathrooms}" required />
            <small v-if="submitted && !item.totalBathrooms" class="p-invalid">Total Bathrooms is required.</small>
          </pv-float-label>
        </div>
        <div class="field mt-5">
          <pv-float-label>
            <label for="totalTelevision">Total Television</label>
            <pv-input-number id="totalTelevision" v-model="item.totalTelevision" :class="{'p-invalid': submitted && !item.totalTelevision}" required />
            <small v-if="submitted && !item.totalTelevision" class="p-invalid">Total Television is required.</small>
          </pv-float-label>
        </div>

        <div class="p-field mt-5">
          <pv-float-label>
            <label for="status">Status</label>
            <pv-dropdown id="status" v-model="item.status" :options="statuses" optionLabel="label" placeholder="Select and Status">
              <template #value="slotProps">
                <div v-if="slotProps.value && slotProps.value.value">
                  <pv-tag :severity="getSeverity(slotProps.value.label)" :value="slotProps.value.value"/>
                </div>
                <div v-else-if="slotProps.value && !slotProps.value.value">
                  <pv-tag :severity="getSeverity(slotProps.value)" :value="slotProps.value"/>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
            </pv-dropdown>
          </pv-float-label>
        </div>

      </div>
    </template>
  </create-and-edit>
</template>