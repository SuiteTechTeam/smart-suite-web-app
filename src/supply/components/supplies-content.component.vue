<script>

import SupplyManagement from "../pages/supply-management.component.vue";

export default {
  name: "supplies-content",
  components: {SupplyManagement}
}
</script>

<template>
    <supply-management :title="$t('supply.title')"/>
</template>
