<script>
import i18n from "../../../i18n.js";

export default {
  name: "monthly-expenses",
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
            label: i18n.global.t("charts.monthly.type"),
            data: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
            backgroundColor: [
              "rgba(54,132,235,0.51)",
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
  <div class="flex flex-column text-center">
    <pv-chart type="line"
              :data="createChartData()"
              :options="chatOptions" class="w-full"
    >
    </pv-chart>
    <p class="font-bold">
      {{ $t("charts.monthly.title") }}
    </p>
  </div>
</template>

<style scoped>

</style>