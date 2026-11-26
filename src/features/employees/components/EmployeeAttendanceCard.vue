<script setup>
// Tab "Kehadiran" pada Detail Karyawan. Dua tampilan: Kalender (default) &
// Daftar. Pada Kalender, klik tanggal → modal set/edit kehadiran manual
// (setManualAttendance). Pada Daftar, riwayat paginated + rentang tanggal +
// pemilih jumlah data. Backend menegakkan izin per-karyawan — aksi edit hanya
// tampil bila operasi diizinkan.
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_ATTENDANCE } from "@/features/attendance/graphql/attendance.queries";
import ManualAttendanceModal from "@/features/attendance/components/ManualAttendanceModal.vue";
import { useEmployeeAttendanceCalendar } from "../composables/useEmployeeAttendanceCalendar";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate, formatTime, formatDuration } from "@/shared/utils/format";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import {
  ClockIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — kehadirannya diambil via employeeId.
  employee: { type: Object, default: null },
});

const auth = useAuthStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

const canSetManual = computed(() => auth.can(PERM.ATTENDANCE_SET_MANUAL));

// Tampilan aktif: "calendar" (default) atau "list".
const viewMode = ref("calendar");
const modes = [
  { key: "calendar", label: "Kalender", icon: CalendarDaysIcon },
  { key: "list", label: "Daftar", icon: ListBulletIcon },
];

// ── Jadwal vs aktual (dipakai Kalender & Daftar) ──────────────────────────────
function logDir(type) {
  const t = String(type ?? "").toLowerCase();
  if (t.includes("out")) return "out";
  if (t.includes("in")) return "in";
  return "other";
}
function sortedLogs(logs) {
  return [...(logs ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}
function actualIn(row) {
  const ins = sortedLogs(row?.logs).filter((l) => logDir(l.attendanceType) === "in");
  return ins.length ? ins[0].timestamp : null;
}
function actualOut(row) {
  const outs = sortedLogs(row?.logs).filter((l) => logDir(l.attendanceType) === "out");
  return outs.length ? outs[outs.length - 1].timestamp : null;
}
function schedIn(row) {
  return row?.scheduledCheckIn || row?.shift?.start_time || null;
}
function schedOut(row) {
  return row?.scheduledCheckOut || row?.shift?.end_time || null;
}
function isHoliday(row) {
  return !!row?.holiday;
}

// ── Kalender ──────────────────────────────────────────────────────────────────
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DOT = {
  ontime: "bg-mahir-success",
  late: "bg-mahir-warning",
  absent: "bg-mahir-danger",
  leave: "bg-mahir-info",
};
function statusKey(row) {
  return String(row?.status ?? "").toLowerCase();
}
function cellClass(cell) {
  if (!cell.inMonth) return "border-transparent bg-transparent";
  if (cell.weekend || (cell.record && isHoliday(cell.record))) {
    return "border-mahir-danger/20 bg-mahir-danger-soft";
  }
  return "border-mahir-border bg-white";
}

const {
  weeks,
  monthLabel,
  loading: calLoading,
  refetch: refetchCalendar,
  prevMonth,
  nextMonth,
  goToday,
} = useEmployeeAttendanceCalendar(employeeId);

// Klik sel kalender: hari ini/sebelumnya & punya izin → buka modal (edit bila ada
// catatan, tambah bila kosong dengan tanggal sel itu).
function selectDay(cell) {
  if (!cell.inMonth || cell.isFuture || !canSetManual.value) return;
  if (cell.record) openEdit(cell.record);
  else openCreate(cell.key);
}

// ── Daftar (paginated) ────────────────────────────────────────────────────────
const dateGte = ref("");
const dateLte = ref("");
const page = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [10, 25, 50, 100];

watch([dateGte, dateLte, pageSize, employeeId], () => {
  page.value = 1;
});

const { result, loading: listLoading, refetch: refetchList } = useQuery(
  LIST_ATTENDANCE,
  () => ({
    params: {
      employeeId: employeeId.value,
      dateGte: dateGte.value || null,
      dateLte: dateLte.value || null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value && viewMode.value === "list", fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listAttendance?.data ?? null);
const records = computed(() => data.value?.results ?? []);
const pagination = computed(() => {
  const count = data.value?.count ?? 0;
  const size = pageSize.value || 10;
  return {
    count,
    currentPage: data.value?.currentPage ?? page.value,
    totalPages: data.value?.totalPages ?? Math.max(1, Math.ceil(count / size)),
    hasNext: data.value?.hasNext ?? false,
    hasPrev: data.value?.hasPrev ?? false,
  };
});

function nextPage() {
  if (pagination.value.hasNext) page.value += 1;
}
function prevPage() {
  if (pagination.value.hasPrev) page.value -= 1;
}
function clearDates() {
  dateGte.value = "";
  dateLte.value = "";
}

// ── Modal set/edit manual ─────────────────────────────────────────────────────
const modalOpen = ref(false);
const editingRecord = ref(null); // null = tambah
const editingDate = ref(""); // tanggal awal saat tambah (dari sel kalender)

function openEdit(row) {
  editingRecord.value = row;
  editingDate.value = "";
  modalOpen.value = true;
}
function openCreate(dateStr = "") {
  editingRecord.value = null;
  editingDate.value = dateStr || "";
  modalOpen.value = true;
}

// Setelah tersimpan: segarkan tampilan yang aktif.
function onSaved() {
  refetchCalendar();
  refetchList();
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
            <ClockIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Kehadiran</h2>
            <p class="text-[11.5px] text-slate-400">
              {{ canSetManual ? "Klik tanggal untuk set / edit kehadiran manual" : "Riwayat kehadiran karyawan" }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Toggle Kalender / Daftar -->
          <div class="inline-flex rounded-xl border border-mahir-border bg-white p-1">
            <button
              v-for="m in modes"
              :key="m.key"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors"
              :class="viewMode === m.key ? 'bg-mahir-primary text-white' : 'text-slate-500 hover:text-slate-800'"
              @click="viewMode = m.key"
            >
              <component :is="m.icon" class="h-4 w-4" />
              {{ m.label }}
            </button>
          </div>

          <!-- Tambah kehadiran manual -->
          <button
            v-if="canSetManual"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
            @click="openCreate()"
          >
            <PlusIcon class="h-4 w-4" /> Tambah
          </button>
        </div>
      </div>

      <!-- ══ KALENDER ══ -->
      <div v-if="viewMode === 'calendar'" class="p-5">
        <!-- Navigasi bulan -->
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarDaysIcon class="h-5 w-5 text-mahir-primary" />
            <h3 class="font-semibold capitalize text-slate-900">{{ monthLabel }}</h3>
            <span v-if="calLoading" class="text-[12px] text-slate-400">memuat…</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" class="rounded-lg border border-mahir-border px-2.5 py-1.5 text-slate-600 hover:bg-slate-50" @click="prevMonth">
              <ChevronLeftIcon class="h-4 w-4" />
            </button>
            <button type="button" class="rounded-lg border border-mahir-border px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50" @click="goToday">
              Hari Ini
            </button>
            <button type="button" class="rounded-lg border border-mahir-border px-2.5 py-1.5 text-slate-600 hover:bg-slate-50" @click="nextMonth">
              <ChevronRightIcon class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Header hari -->
        <div class="grid grid-cols-7 gap-1 pb-1">
          <div
            v-for="d in WEEKDAYS"
            :key="d"
            class="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400"
          >
            {{ d }}
          </div>
        </div>

        <!-- Minggu -->
        <div v-for="(week, wi) in weeks" :key="wi" class="grid grid-cols-7 gap-1 pb-1">
          <button
            v-for="cell in week"
            :key="cell.key"
            type="button"
            :disabled="!cell.inMonth || cell.isFuture || !canSetManual"
            class="flex min-h-[52px] flex-col rounded-lg border p-1 text-left transition sm:min-h-[66px]"
            :class="[
              cellClass(cell),
              cell.inMonth && !cell.isFuture && canSetManual ? 'cursor-pointer hover:border-mahir-primary/50 hover:brightness-[0.99]' : '',
              cell.isFuture && cell.inMonth ? 'opacity-50' : '',
            ]"
            :title="cell.inMonth && !cell.isFuture && canSetManual ? 'Klik untuk set / edit kehadiran' : ''"
            @click="selectDay(cell)"
          >
            <!-- Nomor tanggal + titik status -->
            <div class="flex items-center justify-between">
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full text-[11.5px] font-semibold"
                :class="cell.isToday ? 'bg-mahir-primary text-white' : cell.inMonth ? 'text-slate-700' : 'text-slate-300'"
              >
                {{ cell.day }}
              </span>
              <span
                v-if="cell.record"
                class="h-1.5 w-1.5 rounded-full"
                :class="DOT[statusKey(cell.record)] || 'bg-slate-300'"
              ></span>
            </div>

            <!-- Jam aktual -->
            <div v-if="cell.record" class="mt-auto pt-0.5">
              <div class="hidden text-[10px] font-medium leading-tight text-slate-600 sm:block">
                <span :class="actualIn(cell.record) ? '' : 'text-slate-300'">{{ formatTime(actualIn(cell.record)) }}</span>
                <span class="text-slate-300">–</span>
                <span :class="actualOut(cell.record) ? '' : 'text-slate-300'">{{ formatTime(actualOut(cell.record)) }}</span>
              </div>
            </div>
          </button>
        </div>

        <!-- Keterangan -->
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11.5px] text-slate-500">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-mahir-success"></span> Tepat waktu</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-mahir-warning"></span> Telat</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-mahir-danger"></span> Absen</span>
        </div>
      </div>

      <!-- ══ DAFTAR ══ -->
      <template v-else>
        <!-- Filter daftar -->
        <div class="flex flex-wrap items-center gap-2 border-b border-mahir-border px-5 py-3">
          <select
            v-model.number="pageSize"
            class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
            aria-label="Jumlah data per halaman"
          >
            <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }} / halaman</option>
          </select>
          <div class="flex items-center gap-1.5 rounded-lg border border-mahir-border px-2.5 py-1.5">
            <input v-model="dateGte" type="date" class="bg-transparent text-sm text-slate-700 focus:outline-none" aria-label="Dari tanggal" />
            <span class="text-slate-400">–</span>
            <input v-model="dateLte" type="date" class="bg-transparent text-sm text-slate-700 focus:outline-none" aria-label="Sampai tanggal" />
            <button
              v-if="dateGte || dateLte"
              type="button"
              class="ml-0.5 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Hapus rentang tanggal"
              @click="clearDates"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="p-5">
          <div v-if="listLoading && !records.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat kehadiran…
          </div>
          <div v-else-if="!records.length" class="py-12 text-center text-sm text-slate-400">
            Belum ada catatan kehadiran untuk karyawan ini.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-mahir-border text-left text-[12px] uppercase tracking-wide text-slate-400">
                  <th class="py-2.5 pr-4 font-semibold">Tanggal</th>
                  <th class="py-2.5 pr-4 font-semibold">Shift</th>
                  <th class="py-2.5 pr-4 font-semibold">Jadwal</th>
                  <th class="py-2.5 pr-4 font-semibold">Aktual</th>
                  <th class="py-2.5 pr-4 font-semibold">Durasi</th>
                  <th class="py-2.5 pr-4 font-semibold">Status</th>
                  <th v-if="canSetManual" class="py-2.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in records" :key="row.id" class="border-b border-mahir-border/60 last:border-0">
                  <td class="py-3 pr-4 font-medium text-slate-800">{{ formatDate(row.date) }}</td>
                  <td class="py-3 pr-4 text-slate-600">{{ row.shift?.name || "—" }}</td>
                  <td class="py-3 pr-4 text-slate-500">{{ formatTime(schedIn(row)) }} – {{ formatTime(schedOut(row)) }}</td>
                  <td class="py-3 pr-4 font-medium">
                    <span :class="actualIn(row) ? 'text-mahir-success' : 'text-slate-300'">{{ formatTime(actualIn(row)) }}</span>
                    <span class="mx-1 text-slate-300">–</span>
                    <span :class="actualOut(row) ? 'text-mahir-danger' : 'text-slate-300'">{{ formatTime(actualOut(row)) }}</span>
                  </td>
                  <td class="py-3 pr-4 text-slate-600">{{ formatDuration(row.workedSeconds, { zeroDash: true }) }}</td>
                  <td class="py-3 pr-4"><StatusBadge :status="String(row.status ?? '').toLowerCase()" /></td>
                  <td v-if="canSetManual" class="py-3 text-right">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      @click="openEdit(row)"
                    >
                      <PencilSquareIcon class="h-4 w-4" /> Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer / paginasi -->
        <div v-if="records.length" class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
          <span class="text-[13px] text-mahir-muted">Menampilkan {{ records.length }} dari {{ pagination.count }} catatan</span>
          <nav class="flex items-center gap-1">
            <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!pagination.hasPrev" @click="prevPage">‹</button>
            <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">{{ pagination.currentPage }}</span>
            <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
            <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!pagination.hasNext" @click="nextPage">›</button>
          </nav>
        </div>
      </template>
    </div>

    <!-- Modal set/edit kehadiran manual -->
    <ManualAttendanceModal
      v-model:open="modalOpen"
      :employee="employee"
      :record="editingRecord"
      :default-date="editingDate"
      @saved="onSaved"
    />
  </div>
</template>
