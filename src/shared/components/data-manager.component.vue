<script>

import {FilterMatchMode} from "primevue/api";

export default {
  name: "data-manager",
  inheritAttrs: false,
  props: {
    items: {type: Array, required: true},
    title:  {type: { singular: '', plural: ''}, required: true},
    dynamic: {type: Boolean, default: false},
    columns: {type: Array, default: () => []},
  },
  data() {
    return {
      selectedItems: [],
      filters: null
    }
  },
  created() {
    this.initFilters();
  },
  methods: {
    initFilters() {
      this.filters = {global: {value: null, matchMode: FilterMatchMode.CONTAINS}};
    },
    newItem() {
      this.$emit('new-item');
    },
    editItem(item) {
      this.$emit('edit-item', item);
    },
    confirmDeleteItem(item) {

      this.$confirm.require({
        message:          this.$t('actions.confirm-delete'),
        header:           this.$t('actions.confirmation'),
        icon:             'pi pi-exclamation-triangle',
        rejectClassName:  'p-button-secondary p-button-outlined',
        rejectLabel:      this.$t('actions.cancel'),
        acceptLabel:      this.$t('actions.delete'),
        acceptClassName:  'p-button-danger',
        accept:           () => this.$emit('delete-item', item),
        reject:           () => {}
      });
    }
  }
}
</script>

<template>

  <pv-toast/>

  <pv-confirm-dialog/>
<!--ola-->
<!--  <h3 class="text-center">{{ $t('rooms-monitoring.view.title') }}</h3>-->
<!--  &lt;!&ndash; Toolbar Section &ndash;&gt;-->
<!--  <pv-toolbar class="mb-4">-->
<!--    <template #start>-->
<!--      <pv-button class="mr-2" icon="pi pi-plus" label="New" severity="success" @click="newItem"/>-->
<!--    </template>-->
<!--    <template #end>-->
<!--      <pv-button icon="pi pi-download" label="Export" severity="help" @click="exportToCsv($event)"/>-->
<!--ola-->
  <div class="title">
    <p>{{$t('control-panel')}}</p>
    <h1>{{$t('manage-supplies')}}</h1>
  </div>
  <!-- Toolbar Section -->
  <pv-toolbar class="mb-4">
    <template #start>
      <pv-button class="mr-2" icon="pi pi-plus" :label="$t('actions.new')" severity="success" @click="newItem"/>

    </template>
  </pv-toolbar>

  <!-- Data Table Section -->
  <pv-data-table
      ref="dt"
      v-model:selection="selectedItems"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :rows-per-page-options="[5, 10, 20]"
      :value="items"
      current-page-report-template="Showing {first} to {last} of {totalRecords} ${{title.plural}}"
      data-key="id"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown">
    <slot name="custom-columns"></slot>
    <pv-column v-if="dynamic" v-for="column in columns" :key="column.field" :field="column.field" :header="column.header"/>
    <pv-column :exportable="false" style="min-width:8rem">
      <template #body="slotProps">
        <pv-button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)"/>
      </template>
    </pv-column>
  </pv-data-table>

</template>

<style scoped>
.title {
  p {
    font-size: 1.5rem;
    color: #008000;
    margin-bottom: 0;
  }
  h1{
    font-size: 2rem;
    margin-top: 0;
  }
  text-align: center;
}

</style>