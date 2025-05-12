<script>
import SubscriptionCard from "./subscription-card.vue";


export default {
  name: "subscription-grid",
  components: {SubscriptionCard},
  props: {subscriptions: Array},
}
</script>

<template>
  <div class="grid">
    <div class="col-6" v-for="subscription in subscriptions" aria-label="subscription-card">>
      <subscription-card class="mt-4" :subscription="subscriptions"/>
    </div>
  </div>

</template>

<style scoped>

</style>