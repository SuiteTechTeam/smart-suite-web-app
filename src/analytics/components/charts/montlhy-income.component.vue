<script>
import i18n from "../../../i18n.js";

export default {
  name: "monthly-income",
  data() {
    return {
      chatOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: function(value, index, ticks) {
                return 'S/' + value;
              }
            }
          }
        }
      }
    }
  },
  methods: {
    createChartData() {
      return {
        labels: Array.from({length: 12}, (_, i) => i18n.global.t(`charts.months.${i + 1}`)),
        datasets: [
          {
            label: i18n.global.t("charts.monthly-income-expense.type.income"),
            data: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
            backgroundColor: [
              "rgba(54,132,235,0.51)",
            ],
            borderWidth: 3
          },
          {
            label: i18n.global.t("charts.monthly-income-expense.type.expense"),
            data: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
            backgroundColor: [
              "rgba(255,99,132,0.65)",
            ],
            borderWidth: 3
          }
        ]
      }
    }
  }
}
</script>

<template>
  <div class="flex flex-column items-center">
    <pv-chart type="line"
              :data="createChartData()"
              :options="chatOptions" class="w-full"
    >
    </pv-chart>
    <p class="text-center font-bold">
      {{ $t("charts.monthly-income-expense.title") }}
    </p>
  </div>
</template>

<style scoped>

</style>