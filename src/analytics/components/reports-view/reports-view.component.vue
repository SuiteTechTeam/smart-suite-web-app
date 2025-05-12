<script>
import MonthlyExpenses from "../charts/monthly-expenses.component.vue";
import MonthlyIncome from "../charts/montlhy-income.component.vue";
import RoomChart from "../charts/room-chart.component.vue";

export default {
  name: "reports-view",
  components: {RoomChart, MonthlyIncome, MonthlyExpenses}
}
</script>

<template>
  <pv-panel class="shadow-8 border-round-2xl">
    <div>
      <p class="font-bold text-center text-xl text-primary mb-0 pb-0">
        {{ $t("charts.header")}}
      </p>
      <p class="font-bold text-center text-4xl mt-0 pt-1">
        {{ $t("charts.title")}}
      </p>
    </div>
    <div class="grid">
      <div class="col">
        <monthly-expenses/>
      </div>
      <div class="col">
        <monthly-income/>
      </div>
      <div class="col">
        <room-chart/>
      </div>
    </div>
  </pv-panel>


</template>

<style scoped>

</style>