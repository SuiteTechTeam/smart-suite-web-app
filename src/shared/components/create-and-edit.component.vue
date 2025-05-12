<script>

const defaultStyle = { width: '450px' }

export default {
  name: "create-and-edit",
  props: { entity: null, visible: Boolean, entityName: '', edit: Boolean, size: 'default' },
  methods: {
    onCancel() {
      this.$emit('canceled');
    },
    onSave() {
      this.$emit('saved', this.entity);
    },
    getHeaderTitle() {
      return `${this.edit ? this.$t('actions.edit') : this.$t('actions.new')} ${this.entityName}`;
    },
    getSubmitLabel() {
      return this.edit ? this.$t('actions.update') : this.$t('actions.create');
    },
    getDialogStyle() {
      let dialogStyle = defaultStyle;

      dialogStyle = this.size === 'standard' ? { width: '600px'} : defaultStyle;
      dialogStyle = this.size === 'large' ? { width: '900px'} : defaultStyle;

      return dialogStyle;
    }
  }
}
</script>

<template>
  <!-- Create / Update Dialog -->
  <pv-dialog v-bind:visible="visible" :modal="true" :style="getDialogStyle()" class="p-fluid" :header="entityName">
    <template #header>
      <div class="flex justify-content-start">
        <div>{{ getHeaderTitle() }}</div>
      </div>
    </template>
    <slot name="content"></slot>
    <template #footer>
      <div class="flex justify-content-end">
        <pv-button type="button" :label="getSubmitLabel()" class="p-button-text" icon="pi pi-check" @click="onSave"/>
        <pv-button type="button" :label="$t('actions.cancel')" severity="secondary" class="p-button-text" icon="pi pi-times" @click="onCancel"/>
      </div>
    </template>
  </pv-dialog>
</template>