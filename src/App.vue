<script>
import ToolbarComponent from "./public/components/toolbar.component.vue";

export default {
  name: "app",
  components: {ToolbarComponent},
}

</script>

<template>
  <pv-toast position="bottom-center"/>
  <header>
    <toolbar-component/>
  </header>
  <div class="container">
    <router-view class="router-view" />
  </div>

</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.router-view {
  flex: 1;
  overflow-y: auto;
}
</style>