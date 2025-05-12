<script>
import {FilterMatchMode} from "primevue/api";

export default {
  name: "notification-table",
  props: {
    items: Array,
    columns: Array
  },
  data() {
    return {
      selectedItems: Array,
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
    fixedColumnHeader(header) {
      let fixedHeader = header.replace(/([A-Z])/g, ' $1');

      fixedHeader = fixedHeader.charAt(0).toLowerCase() + fixedHeader.slice(1);

      return fixedHeader;
    }
  }
}
</script>

<template>
  <pv-data-table
      :paginator="true"
      :value="items"
      :filters="filters"
      dataKey="id"
      :rows="5"
      :rows-per-page-options="[5, 10, 20]"
      :current-page-report-template="'Showing {first} to {last} of {totalRecords} entries'"
      tableStyle="min-width: 50rem"
  >
    <template #header>
      <p class="font-bold text-center text-xl text-primary mb-0 pb-0">
        {{ $t("interaction.notifications.title")}}
      </p>
      <div class="flex flex-wrap align-items-center justify-content-between gap-2 text-center">
        <pv-button icon="pi pi-refresh" rounded raised/>
      </div>
    </template>
    <pv-column v-for="column in columns"
               :field="column"
               :key="column"
                sortable>
      <template #header>
        <div class="w-full text-center font-bold h-auto bg-primary d-flex align-items-stretch">
          {{ $t("interaction.notifications.headers." + fixedColumnHeader(column)) }}
        </div>
      </template>
    </pv-column>
    <slot name="notification-columns"></slot>
    <template #footer>En total hay {{ items ? items.length : 0 }}</template>
  </pv-data-table>
</template>