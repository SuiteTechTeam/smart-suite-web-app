<script>
import ReportsView from "../../analytics/components/reports-view/reports-view.component.vue";
import NotificationsContent from "../../interaction/components/notifications-content.component.vue";

export default {
  name: "control-panel-page",
  components: {NotificationsContent, ReportsView}
}
</script>

<template>
  <reports-view/>
  <notifications-content/>
</template>

<style scoped>

</style>