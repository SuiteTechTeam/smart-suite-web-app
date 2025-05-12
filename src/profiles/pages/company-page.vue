<script>
import CompanyContent from "../components/company-view/company-content.component.vue";
import CompanyEmployeesContent from "../components/company-view/company-employees-content.component.vue";

export default {
  name: "company-page",
  components: {CompanyEmployeesContent, CompanyContent},
  data() {
    return {
      company: {
        business_name: "Company Name",
        ruc: "123456789",
      },
      employees: [
        {name: "Employee 1"},
        {name: "Employee 2"},
        {name: "Employee 3"},
      ],
      can_edit: true,
    }
  }
}
</script>

<template>
  <company-content :company="company" :can_edit="can_edit"/>
  <company-employees-content :employees="employees" :can_invite="can_edit"/>
</template>

<style scoped>

</style>