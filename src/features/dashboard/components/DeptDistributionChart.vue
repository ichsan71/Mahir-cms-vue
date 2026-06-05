<script setup>
// Doughnut distribusi departemen (opsi diport dari modules/dashboard.js)
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ dept, count }]
});

const PALETTE = ["#243B8F", "#1B9C67", "#D98E18", "#2884E8", "#D14343", "#64748B", "#7C3AED", "#0EA5E9"];

const chartData = computed(() => ({
  labels: props.data.map((d) => d.dept),
  datasets: [
    {
      data: props.data.map((d) => d.count),
      backgroundColor: props.data.map((_, i) => PALETTE[i % PALETTE.length]),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: {
    legend: { position: "bottom", labels: { font: { family: "Inter", size: 12 }, boxWidth: 10 } },
  },
};
</script>

<template>
  <div class="h-60">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
