<script>
export default {
  // *
  // * @name company-content
  // * @description Componente que muestra la información de la empresa
  // *
  // * @param {Object} company - Información de la empresa
  // * @param {Boolean} can_edit - Indica si se puede editar la información de la empresa
  // *
  name: "company-content",
  props: {
    company: {
      type: Object,
      required: true,
    },
    can_edit: {
      type: Boolean,
      required: true,
    },
  }
}
</script>

<template>
  <pv-panel class="border-round-3xl m-auto shadow-5">
    <div class="flex flex-row w-full">
      <div class="flex flex-column mr-5 w-4">
        <div class="flex align-items-center justify-content-center col-12 col-md-6 pb-0 mb-0">
          <h2>
            {{ can_edit ? $t('company.view.title') : $t('company.view.info') }}
          </h2>
        </div>
        <div class="flex align-items-center justify-content-center col-auto max-h-3rem">
          <pv-avatar icon="pi pi-user" size="xlarge" shape="circle"/>
        </div>
      </div>
      <div class="flex flex-column flex-auto">
        <div class="col-12 col-md-6">
          <div class="flex flex-column">
            <p>
              <strong class="text-2xl mr-3">
                {{ $t('company.view.business-name') }}:
              </strong>
              {{ company.business_name }}
            </p>
            <a v-if="can_edit" class="text-primary underline text-sm mb-1" href="#">
              {{ $t('company.view.change-business-name') }}
            </a>
          </div>
          <pv-divider class="mt-2 mb-0 pb-0"/>
        </div>
        <div class="col-12 col-md-6">
          <div class="flex flex-column">
            <p>
              <strong class="text-2xl mr-3">
                RUC:
              </strong>
              {{ company.ruc }}
            </p>
            <a v-if="can_edit" class="text-primary underline text-sm mb-1" href="#">
              {{ $t('company.view.change-ruc') }}
            </a>
          </div>
          <pv-divider class="mt-2 mb-0 pb-0"/>
        </div>
        <div v-if="can_edit" class="col-12 col-md-6">
          <div class="flex flex-column">
            <p class="mb-1">
              <strong class="text-2xl mr-3">
                {{ $t('company.view.company') }}
              </strong>
            </p>
            <a class="underline text-sm" style="color: red">
              {{ $t('company.view.delete-company') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </pv-panel>
</template>

<style scoped>

</style>