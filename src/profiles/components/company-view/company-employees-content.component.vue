
<script>
export default {
  // *
  // * @name company-employees-content
  // * @description Componente que muestra la lista de empleados de la empresa
  // *
  // * @param {Array} employees - Lista de empleados de la empresa
  // * @param {Boolean} can_invite - Indica si se puede invitar a un empleado
  // *
  name: "company-employees-content",
  props: {
    employees: {
      type: Array,
      required: true,
    },
    can_invite: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      searchValue: "",
    }
  },
}
</script>

<template>
  <pv-panel class="mt-5 border-round-3xl m-auto shadow-5">
    <div class="flex flex-column w-full">
      <h2 class="ml-2">
        {{ $t('company.employees.title') }}
      </h2>
      <div class="flex flex-auto justify-content-between align-content-between">
        <div class="flex">
          <pv-icon-field>
            <pv-input-icon class="pi pi-search"></pv-input-icon>
            <pv-float-label>
              <pv-input-text v-model="searchValue"></pv-input-text>
              <label>
                {{ $t('company.employees.search-employee') }}
              </label>
            </pv-float-label>
          </pv-icon-field>
        </div>
        <div v-if="can_invite" class="flex">
          <pv-button class="border-round-3xl">
            {{ $t('company.employees.invite-employee') }}
          </pv-button>
        </div>
      </div>
      <div class="grid mt-7">
        <div v-for="employee in employees" class="col">
          <div class="text-center p-3">
            <pv-avatar class="mr-2" size="xlarge" icon="pi pi-user" shape="circle"></pv-avatar>
            <div>
              <p>
                {{ employee.name }}
              </p>
              <a class="text-primary text-sm" ref="#">
                {{ $t('company.employees.see-more') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </pv-panel>
</template>

<style scoped>

</style>