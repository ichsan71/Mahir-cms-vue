<script setup>
// Bagian ringkasan kehadiran realtime untuk Dashboard (gaya HRIS). Redesign:
// 5 KPI digabung jadi 1 strip + bar komposisi (menggantikan doughnut yang
// redundan), dan 3 kartu daftar orang (Terlambat/Cuti/Belum Absen) digabung
// jadi 1 kartu bertab. Grafik tren tetap Chart.js. Data via GraphQL
// subscription (attendanceDashboard) — lihat useAttendanceDashboard.
// Self-gating: hanya tampil bila akun punya izin attendanceDashboard.
import { computed, ref } from "vue";
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
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "@/features/attendance/permissions";
import { useAttendanceDashboard } from "../composables/useAttendanceDashboard";
import { useAttendanceExport } from "@/features/attendance/composables/useAttendanceExport";
import AttendanceExportModal from "@/features/attendance/components/AttendanceExportModal.vue";
import { initials } from "@/shared/utils/format";
import {
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
const { loading, error, dates, latestDate, latestSummary, trend, totalEmployee } =
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

// Bar komposisi hari ini (menggantikan doughnut): proporsi tiap status.
const compTotal = computed(() => latestSummary.value.reduce((a, s) => a + s.count, 0));
function compWidth(count) {
  const t = compTotal.value;
  return t ? `${(count / t) * 100}%` : "0%";
}

// Daftar karyawan per status pada hari terbaru (dari baris status terkait).
function employeesFor(status) {
  const row = latestSummary.value.find((s) => s.status === status);
  return row?.employees ?? [];
}
const lateEmployees = computed(() => employeesFor("LATE"));
const leaveEmployees = computed(() => employeesFor("ON_LEAVE"));
const pendingEmployees = computed(() => employeesFor("PENDING"));

// Kartu "Perlu Perhatian" bertab (gabungan 3 kartu lama).
const peopleTabs = computed(() => [
  { key: "late", label: "Terlambat", color: "#D98E18", employees: lateEmployees.value, empty: "Tidak ada keterlambatan hari ini" },
  { key: "leave", label: "Cuti / Izin", color: "#2884E8", employees: leaveEmployees.value, empty: "Tidak ada yang cuti / izin hari ini" },
  { key: "pending", label: "Belum Absen", color: "#64748B", employees: pendingEmployees.value, empty: "Semua sudah absen hari ini" },
]);
const activeTab = ref("late");
const activeTabObj = computed(
  () => peopleTabs.value.find((t) => t.key === activeTab.value) ?? peopleTabs.value[0],
);
const activeList = computed(() => activeTabObj.value.employees);

// Modal "Lihat semua" (daftar lengkap, scrollable) — mempertahankan flow lama.
const PEOPLE_LIMIT = 5;
const peopleModalOpen = ref(false);

// KPI utama (gaya HRIS).
const KPIS = [
  { status: "PRESENT", label: "Hadir Hari Ini", icon: CheckCircleIcon, color: "#1B9C67", bg: "#E2F8EC" },
  { status: "LATE", label: "Terlambat", icon: ClockIcon, color: "#D98E18", bg: "#FFF3DA" },
  { status: "ON_LEAVE", label: "Cuti / Izin", icon: CalendarDaysIcon, color: "#2884E8", bg: "#E0EDFF" },
  { status: "ABSENT", label: "Tidak Hadir", icon: XCircleIcon, color: "#EF4444", bg: "#FEE2E2" },
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
</script>

<template>
  <section v-if="canView || $slots.default" class="space-y-5">
    <!-- Header bagian (hanya bila punya izin kehadiran) -->
    <div v-if="canView" class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <UserGroupIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Ringkasan Kehadiran</h2>
          <p v-if="latestLabel" class="text-[11.5px] text-slate-400">
            Per {{ latestLabel }}
            <span v-if="totalEmployee"> · {{ totalEmployee }} karyawan</span>
          </p>
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
      v-if="canView && (loading || error) && !hasData"
      class="rounded-2xl border border-mahir-border bg-white py-12 text-center text-sm"
      :class="error ? 'text-mahir-danger' : 'text-slate-400'"
    >
      {{ error ? "Gagal memuat ringkasan kehadiran." : "Menyambungkan data kehadiran…" }}
    </div>
    <div
      v-else-if="canView && !hasData"
      class="rounded-2xl border border-mahir-border bg-white py-12 text-center text-sm text-slate-400"
    >
      Belum ada data kehadiran.
    </div>

    <!-- KPI strip (1 kartu, 5 segmen) + bar komposisi -->
    <div
      v-if="canView && hasData"
      class="overflow-hidden rounded-2xl border border-mahir-border bg-white shadow-sm"
    >
      <div class="grid grid-cols-2 gap-px bg-mahir-border sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="kpi in KPIS" :key="kpi.status" class="bg-white p-4">
          <div class="flex items-center gap-2">
            <span
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              :style="{ backgroundColor: kpi.bg, color: kpi.color }"
            >
              <component :is="kpi.icon" class="h-4 w-4" />
            </span>
            <span class="text-2xl font-bold leading-none text-slate-900 tabular-nums">
              {{ countFor(kpi.status) }}
            </span>
          </div>
          <p class="mt-2 text-[13px] text-slate-500">{{ kpi.label }}</p>
        </div>
      </div>
      <!-- bar komposisi (pengganti doughnut) -->
      <div v-if="compTotal" class="flex h-1.5 w-full overflow-hidden">
        <span
          v-for="s in latestSummary"
          :key="s.status"
          :style="{ width: compWidth(s.count), backgroundColor: s.color }"
        ></span>
      </div>
    </div>

    <!-- Tren (kiri) + rail kanan (Perlu Perhatian + Pengumuman) -->
    <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
      <!-- Kiri: grafik tren -->
      <div class="space-y-5 xl:col-span-2">
        <div
          v-if="canView && hasData"
          class="min-w-0 rounded-2xl border border-mahir-border bg-white p-5 shadow-sm"
        >
          <h3 class="mb-4 font-semibold text-slate-900">Tren Kehadiran</h3>
          <div class="h-64">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </div>
      </div>

      <!-- Kanan: pengumuman (slot) di atas, lalu kartu bertab -->
      <div class="space-y-5 xl:col-span-1">
        <!-- Pengumuman (dari slot) -->
        <slot />

        <div
          v-if="canView && hasData"
          class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm"
        >
          <h3 class="mb-3 text-sm font-semibold text-slate-900">Perlu Perhatian Hari Ini</h3>

          <!-- Tabs -->
          <div class="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
            <button
              v-for="t in peopleTabs"
              :key="t.key"
              type="button"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors"
              :class="activeTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = t.key"
            >
              {{ t.label }}
              <span
                class="rounded-full px-1.5 text-[10px] font-bold"
                :class="activeTab === t.key ? 'bg-mahir-primary text-white' : 'bg-slate-200 text-slate-500'"
              >
                {{ t.employees.length }}
              </span>
            </button>
          </div>

          <!-- Daftar (maks 5) -->
          <div v-if="activeList.length" class="flex flex-col">
            <div
              v-for="e in activeList.slice(0, PEOPLE_LIMIT)"
              :key="e.id"
              class="flex items-center gap-2.5 border-t border-slate-100 py-2 first:border-t-0"
            >
              <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary">
                {{ initials(e.fullName) }}
              </span>
              <span class="text-[13px] font-medium text-slate-800">{{ e.fullName }}</span>
              <span
                class="ml-auto h-2 w-2 flex-shrink-0 rounded-full"
                :style="{ backgroundColor: activeTabObj.color }"
              ></span>
            </div>
            <button
              v-if="activeList.length > PEOPLE_LIMIT"
              type="button"
              class="mt-2 text-left text-xs font-semibold text-mahir-primary hover:underline"
              @click="peopleModalOpen = true"
            >
              Lihat semua {{ activeList.length }} karyawan →
            </button>
          </div>
          <p v-else class="py-5 text-center text-xs text-slate-400">{{ activeTabObj.empty }}</p>
        </div>
      </div>
    </div>

    <!-- Modal daftar lengkap "Perlu Perhatian" (read-only, scrollable) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="peopleModalOpen"
          class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
          @click.self="peopleModalOpen = false"
        >
          <div class="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div class="flex items-center justify-between border-b border-mahir-border px-5 py-4">
              <div class="flex items-center gap-2">
                <h5 class="text-sm font-semibold text-slate-900">{{ activeTabObj.label }} Hari Ini</h5>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {{ activeList.length }}
                </span>
              </div>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                @click="peopleModalOpen = false"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <div class="overflow-y-auto px-5 py-3">
              <div
                v-for="e in activeList"
                :key="e.id"
                class="flex items-center gap-2.5 border-t border-slate-100 py-2 first:border-t-0"
              >
                <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary">
                  {{ initials(e.fullName) }}
                </span>
                <span class="text-[13px] font-medium text-slate-800">{{ e.fullName }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal ekspor kehadiran ke email -->
    <AttendanceExportModal
      v-model:open="exportOpen"
      :saving="exporting"
      @submit="handleExport"
    />
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
