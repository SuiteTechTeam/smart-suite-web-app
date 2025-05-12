<script>
import i18n from "../../../i18n.js";

export default {
  name: "room-chart",
  data() {
    return {
      chatOptions: {
        responsive: true,
        maintainAspectRatio: false,
      }
    }
  },
  methods: {
    createChartData() {
      return {
        labels: Array.from({length: 4}, (_, i) => i18n.global.t(`charts.room.types.${i + 1}`)),
        datasets: [
          {
            label: i18n.global.t("charts.room.type"),
            data: [23, 3, 3, 2],
            backgroundColor: [
              "rgba(255,99,132,0.5)",
              "rgba(54,132,235,0.51)",
              "rgba(255,206,86,0.54)",
              "rgba(75,192,192,0.56)",
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
    <pv-chart type="bar"
              :data="createChartData()"
              :options="chatOptions" class="w-full"
    >
    </pv-chart>
    <p class="font-bold">
      {{ $t("charts.room.title") }}
    </p>
  </div>
</template>

<style scoped>

</style>