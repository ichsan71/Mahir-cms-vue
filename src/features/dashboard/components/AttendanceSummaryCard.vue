<script setup>
// Bagian ringkasan kehadiran realtime untuk Dashboard (gaya HRIS): kartu KPI +
// tren harian (stacked bar) + komposisi hari ini (doughnut). Data via GraphQL
// subscription (attendanceDashboard) — lihat useAttendanceDashboard.
// Self-gating: hanya tampil bila akun punya izin attendanceDashboard.
import { computed, ref } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import StatsCard from "@/shared/components/StatsCard.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "@/features/attendance/permissions";
import { useAttendanceDashboard } from "../composables/useAttendanceDashboard";
import { useAttendanceExport } from "@/features/attendance/composables/useAttendanceExport";
import AttendanceExportModal from "@/features/attendance/components/AttendanceExportModal.vue";
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/outline";

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const auth = useAuthStore();
const canView = computed(() => auth.can(PERM.DASHBOARD));
const canExport = computed(() => auth.can(PERM.EXPORT));

// Ekspor kehadiran ke email (proses async di backend).
const { exportAttendance, loading: exporting } = useAttendanceExport();
const exportOpen = ref(false);

async function handleExport(payload) {
  const result = await exportAttendance(payload);
  if (result) exportOpen.value = false;
}

// Subscription hanya aktif saat punya izin (hindari koneksi WS sia-sia).
const { loading, error, dates, latestDate, latestSummary, latestTotal, trend } =
  useAttendanceDashboard(() => ({ enabled: canView.value }));

const hasData = computed(() => dates.value.length > 0);

// Lookup cepat status → jumlah pada hari terbaru.
const countByStatus = computed(() => {
  const map = {};
  for (const s of latestSummary.value) map[s.status] = s.count;
  return map;
});
function countFor(status) {
  return countByStatus.value[status] ?? 0;
}
function pctText(status) {
  const total = latestTotal.value;
  if (!total) return null;
  return `${Math.round((countFor(status) / total) * 100)}% dari ${total}`;
}

// Empat KPI utama (gaya HRIS).
const KPIS = [
  { status: "PRESENT", label: "Hadir Hari Ini", icon: CheckCircleIcon, color: "#1B9C67", bg: "#E2F8EC" },
  { status: "LATE", label: "Terlambat", icon: ClockIcon, color: "#D98E18", bg: "#FFF3DA" },
  { status: "ON_LEAVE", label: "Cuti / Izin", icon: CalendarDaysIcon, color: "#2884E8", bg: "#E0EDFF" },
  { status: "PENDING", label: "Belum Absen", icon: ExclamationCircleIcon, color: "#64748B", bg: "#F1F5F9" },
];

// Label tanggal terbaru "Sen, 4 Agu 2026".
const latestLabel = computed(() => {
  if (!latestDate.value) return "";
  const d = new Date(latestDate.value);
  if (Number.isNaN(d.getTime())) return latestDate.value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
});

function shortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d);
}

// Stacked bar: tren harian per status.
const barData = computed(() => ({
  labels: trend.value.labels.map(shortDate),
  datasets: trend.value.datasets.map((ds) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.color,
    borderRadius: 4,
    stack: "attendance",
  })),
}));

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { font: { family: "Inter", size: 12 }, boxWidth: 12, padding: 14 } },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
  },
};

// Doughnut: komposisi status hari terbaru.
const doughnutData = computed(() => ({
  labels: latestSummary.value.map((s) => s.label),
  datasets: [
    {
      data: latestSummary.value.map((s) => s.count),
      backgroundColor: latestSummary.value.map((s) => s.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: {
    legend: { position: "bottom", labels: { font: { family: "Inter", size: 12 }, boxWidth: 10, padding: 12 } },
  },
};
</script>

<template>
  <section v-if="canView" class="space-y-4">
    <!-- Header bagian -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <UserGroupIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Ringkasan Kehadiran</h2>
          <p v-if="latestLabel" class="text-[11.5px] text-slate-400">Per {{ latestLabel }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="canExport"
          type="button"
          class="flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="exportOpen = true"
        >
          <ArrowDownTrayIcon class="h-4 w-4" /> Ekspor
        </button>
        <span class="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-mahir-success">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-mahir-success opacity-60"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-mahir-success"></span>
          </span>
          Realtime
        </span>
      </div>
    </div>

    <!-- State: loading / error / kosong -->
    <div
      v-if="(loading || error) && !hasData"
      class="rounded-2xl border border-mahir-border bg-white py-12 text-center text-sm"
      :class="error ? 'text-mahir-danger' : 'text-slate-400'"
    >
      {{ error ? "Gagal memuat ringkasan kehadiran." : "Menyambungkan data kehadiran…" }}
    </div>
    <div
      v-else-if="!hasData"
      class="rounded-2xl border border-mahir-border bg-white py-12 text-center text-sm text-slate-400"
    >
      Belum ada data kehadiran.
    </div>

    <template v-else>
      <!-- Kartu KPI -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          v-for="kpi in KPIS"
          :key="kpi.status"
          :value="countFor(kpi.status)"
          :label="kpi.label"
          :icon="kpi.icon"
          :color="kpi.color"
          :bg-color="kpi.bg"
          :delta="pctText(kpi.status)"
          delta-dir="up"
        />
      </div>

      <!-- Tren (kiri, lebar) + Komposisi hari ini (kanan) -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-mahir-border bg-white p-5 lg:col-span-2">
          <h3 class="mb-4 font-semibold text-slate-900">Tren Kehadiran</h3>
          <div class="h-64">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </div>

        <div class="rounded-2xl border border-mahir-border bg-white p-5">
          <h3 class="mb-4 font-semibold text-slate-900">Komposisi Hari Ini</h3>
          <div class="h-64">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
        </div>
      </div>
    </template>

    <!-- Modal ekspor kehadiran ke email -->
    <AttendanceExportModal
      v-model:open="exportOpen"
      :saving="exporting"
      @submit="handleExport"
    />
  </section>
</template>
