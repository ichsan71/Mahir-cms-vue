<script setup>
// Stacked bar chart kehadiran mingguan (opsi diport dari modules/dashboard.js)
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ day, present, late, absent }]
});

const chartData = computed(() => ({
  labels: props.data.map((d) => d.day),
  datasets: [
    { label: "Hadir", data: props.data.map((d) => d.present), backgroundColor: "#243B8F", borderRadius: 6 },
    { label: "Terlambat", data: props.data.map((d) => d.late), backgroundColor: "#F59E0B", borderRadius: 6 },
    { label: "Tidak Hadir", data: props.data.map((d) => d.absent), backgroundColor: "#E2E8F0", borderRadius: 6 },
  ],
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { font: { family: "Inter", size: 12 }, boxWidth: 12 } },
  },
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 10 } },
  },
};
</script>

<template>
  <div class="h-60">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
