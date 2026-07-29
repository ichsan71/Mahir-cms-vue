<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useAttendanceCalendar } from "../composables/useAttendanceCalendar";
import AttendanceLeaveTodayCard from "./AttendanceLeaveTodayCard.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate, formatTime, formatDuration } from "@/shared/utils/format";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const { weeks, summary, monthLabel, loading, prevMonth, nextMonth, goToday } =
  useAttendanceCalendar();

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const cards = [
  { key: "ontime", label: "Tepat Waktu", cls: "text-mahir-success" },
  { key: "late", label: "Terlambat", cls: "text-mahir-warning" },
  { key: "absent", label: "Tidak Hadir", cls: "text-mahir-danger" },
  { key: "leave", label: "Cuti/Izin", cls: "text-mahir-info" },
];

// Titik status kehadiran (ditampilkan di pojok sel).
const DOT = {
  ontime: "bg-mahir-success",
  late: "bg-mahir-warning",
  absent: "bg-mahir-danger",
  leave: "bg-mahir-info",
};
function statusKey(row) {
  return String(row?.status ?? "").toLowerCase();
}

// Latar sel dibedakan berdasarkan JENIS HARI (bukan status kehadiran):
// hari libur — akhir pekan atau tanggal libur (dari data holiday) → merah soft;
// hari kerja → putih.
function cellClass(cell) {
  if (!cell.inMonth) return "border-transparent bg-transparent";
  if (cell.weekend || (cell.record && isHoliday(cell.record))) {
    return "border-mahir-danger/20 bg-mahir-danger-soft hover:brightness-[0.98]";
  }
  return "border-mahir-border bg-white hover:border-mahir-primary/40";
}

// Sel terpilih → detail ditampilkan dalam modal. Hanya hari yang punya catatan.
const selected = ref(null);
function selectDay(cell) {
  if (!cell.inMonth || !cell.record) return;
  selected.value = cell;
}
function closeDetail() {
  selected.value = null;
}
// Tutup modal saat pindah bulan (sel lama bisa hilang dari grid).
watch(monthLabel, closeDetail);
const selectedRecord = computed(() => selected.value?.record ?? null);

// Tutup modal dengan tombol Escape.
function onKeydown(e) {
  if (e.key === "Escape") closeDetail();
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

// --- Helper log (selaras dengan AttendanceTable) ---
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
function holidayLabel(row) {
  const h = row?.holiday;
  if (typeof h === "string" && h.trim()) return h;
  if (h && typeof h === "object" && h.name) return h.name;
  return "Hari Libur";
}
function mapsUrl(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
</script>

<template>
  <!-- Ringkasan status (bulan aktif) -->
  <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
    <div
      v-for="c in cards"
      :key="c.key"
      class="rounded-2xl border border-mahir-border bg-white px-4 py-3 shadow-sm"
    >
      <div class="text-2xl font-bold leading-tight" :class="c.cls">{{ summary[c.key] }}</div>
      <div class="text-[12.5px] text-mahir-muted">{{ c.label }}</div>
    </div>
  </div>

  <!-- Kalender (kiri, lebih ringkas) + Cuti hari ini (kanan) -->
  <div class="grid items-start gap-5 lg:grid-cols-3">
    <!-- Kartu kalender -->
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white lg:col-span-2">
    <!-- Navigasi bulan -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <div class="flex items-center gap-2">
        <CalendarDaysIcon class="h-5 w-5 text-mahir-primary" />
        <h2 class="font-semibold capitalize text-slate-900">{{ monthLabel }}</h2>
        <span v-if="loading" class="text-[12px] text-slate-400">memuat…</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="rounded-lg border border-mahir-border px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
          @click="prevMonth"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="rounded-lg border border-mahir-border px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
          @click="goToday"
        >
          Hari Ini
        </button>
        <button
          type="button"
          class="rounded-lg border border-mahir-border px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
          @click="nextMonth"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Grid kalender -->
    <div class="px-3 pb-4 sm:px-5">
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
          :disabled="!cell.inMonth"
          class="flex min-h-[48px] flex-col rounded-lg border p-1 text-left transition sm:min-h-[62px]"
          :class="[
            cellClass(cell),
            selected?.key === cell.key ? 'ring-2 ring-mahir-primary' : '',
          ]"
          @click="selectDay(cell)"
        >
          <!-- Nomor tanggal -->
          <div class="flex items-center justify-between">
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full text-[11.5px] font-semibold"
              :class="cell.isToday
                ? 'bg-mahir-primary text-white'
                : cell.inMonth ? 'text-slate-700' : 'text-slate-300'"
            >
              {{ cell.day }}
            </span>
            <span
              v-if="cell.record"
              class="h-1.5 w-1.5 rounded-full"
              :class="DOT[statusKey(cell.record)] || 'bg-slate-300'"
            ></span>
          </div>

          <!-- Info ringkas kehadiran -->
          <div v-if="cell.record" class="mt-auto pt-0.5">
            <div v-if="isHoliday(cell.record)" class="truncate text-[9.5px] font-semibold text-mahir-danger">
              {{ holidayLabel(cell.record) }}
            </div>
            <div class="hidden text-[10px] font-medium leading-tight text-slate-600 lg:block">
              <span :class="actualIn(cell.record) ? '' : 'text-slate-300'">{{ formatTime(actualIn(cell.record)) }}</span>
              <span class="text-slate-300">–</span>
              <span :class="actualOut(cell.record) ? '' : 'text-slate-300'">{{ formatTime(actualOut(cell.record)) }}</span>
            </div>
          </div>
        </button>
      </div>

      <!-- Keterangan warna jenis hari -->
      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11.5px] text-slate-500">
        <span class="inline-flex items-center gap-1.5">
          <span class="h-3 w-3 rounded border border-mahir-border bg-white"></span> Hari kerja
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="h-3 w-3 rounded border border-mahir-danger/20 bg-mahir-danger-soft"></span> Libur
        </span>
      </div>
    </div>
    </div>

    <!-- Panel: karyawan cuti hari ini (kanan) -->
    <AttendanceLeaveTodayCard />
  </div>

  <!-- Detail hari terpilih (modal) -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="selected"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="closeDetail"
      >
        <div class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between gap-2 border-b border-mahir-border px-6 py-4">
            <div>
              <div class="text-[15px] font-bold text-slate-900">{{ formatDate(selected.key) }}</div>
              <div v-if="selectedRecord && isHoliday(selectedRecord)" class="text-[12px] font-medium text-mahir-danger">
                {{ holidayLabel(selectedRecord) }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <StatusBadge v-if="selectedRecord" :status="statusKey(selectedRecord)" />
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                @click="closeDetail"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto px-6 py-5">
      <!-- Jadwal vs aktual + durasi -->
      <div class="mb-4 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-mahir-border bg-slate-50/60 px-3.5 py-2.5">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Jadwal</div>
          <div class="text-[13.5px] font-medium text-slate-600">
            {{ formatTime(schedIn(selectedRecord)) }} – {{ formatTime(schedOut(selectedRecord)) }}
          </div>
        </div>
        <div class="rounded-xl border border-mahir-border bg-slate-50/60 px-3.5 py-2.5">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Aktual</div>
          <div class="text-[13.5px] font-semibold text-slate-800">
            <span :class="actualIn(selectedRecord) ? 'text-mahir-success' : 'text-slate-300'">{{ formatTime(actualIn(selectedRecord)) }}</span>
            <span class="mx-1 text-slate-300">–</span>
            <span :class="actualOut(selectedRecord) ? 'text-mahir-danger' : 'text-slate-300'">{{ formatTime(actualOut(selectedRecord)) }}</span>
          </div>
        </div>
        <div class="rounded-xl border border-mahir-border bg-slate-50/60 px-3.5 py-2.5">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Durasi Kerja</div>
          <div class="inline-flex items-center gap-1 text-[13.5px] font-semibold text-slate-800">
            <ClockIcon class="h-3.5 w-3.5 text-slate-400" />
            {{ formatDuration(selectedRecord.workedSeconds, { zeroDash: true }) }}
          </div>
        </div>
      </div>

      <!-- Penanda telat / pulang cepat -->
      <div
        v-if="Number(selectedRecord.lateSeconds) > 0 || Number(selectedRecord.earlyLeaveSeconds) > 0"
        class="mb-4 flex flex-wrap gap-1.5"
      >
        <span
          v-if="Number(selectedRecord.lateSeconds) > 0"
          class="rounded bg-mahir-warning-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-warning"
        >
          Telat {{ formatDuration(selectedRecord.lateSeconds) }}
        </span>
        <span
          v-if="Number(selectedRecord.earlyLeaveSeconds) > 0"
          class="rounded bg-mahir-danger-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-danger"
        >
          Pulang cepat {{ formatDuration(selectedRecord.earlyLeaveSeconds) }}
        </span>
      </div>

      <!-- Info shift -->
      <div
        v-if="selectedRecord.shift"
        class="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-mahir-border bg-white px-3.5 py-2.5 text-[12px]"
      >
        <span class="font-semibold text-slate-700">{{ selectedRecord.shift.name }}</span>
        <span class="text-slate-500">
          Kerja
          <span class="font-medium text-slate-700">{{ formatTime(selectedRecord.shift.start_time) }}–{{ formatTime(selectedRecord.shift.end_time) }}</span>
        </span>
        <span v-if="selectedRecord.shift.break_start || selectedRecord.shift.break_end" class="text-slate-500">
          Istirahat
          <span class="font-medium text-slate-700">{{ formatTime(selectedRecord.shift.break_start) }}–{{ formatTime(selectedRecord.shift.break_end) }}</span>
        </span>
      </div>

      <div class="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Riwayat Tap ({{ (selectedRecord.logs || []).length }})
      </div>

      <div v-if="!selectedRecord.logs?.length" class="py-3 text-center text-[13px] text-slate-400">
        Tidak ada log absensi untuk hari ini.
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="log in sortedLogs(selectedRecord.logs)"
          :key="log.id"
          class="flex items-start gap-3 rounded-lg border border-mahir-border bg-white p-3"
        >
          <div
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            :class="logDir(log.attendanceType) === 'out'
              ? 'bg-mahir-danger-soft text-mahir-danger'
              : 'bg-mahir-success-soft text-mahir-success'"
          >
            <component
              :is="logDir(log.attendanceType) === 'out' ? ArrowRightOnRectangleIcon : ArrowLeftOnRectangleIcon"
              class="h-5 w-5"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[13.5px] font-semibold text-slate-800">{{ formatTime(log.timestamp) }}</span>
              <span class="text-[12px] font-medium text-slate-500">{{ log.attendanceType || "—" }}</span>
              <span
                v-if="log.isManual"
                class="inline-flex items-center gap-1 rounded bg-mahir-info-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-info"
              >
                <PencilSquareIcon class="h-3 w-3" /> Manual
              </span>
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
              <span v-if="log.source" class="inline-flex items-center gap-1">
                <DevicePhoneMobileIcon class="h-3.5 w-3.5 text-slate-400" />
                {{ log.source }}
              </span>
              <a
                v-if="mapsUrl(log.latitude, log.longitude)"
                :href="mapsUrl(log.latitude, log.longitude)"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 text-mahir-primary hover:underline"
              >
                <MapPinIcon class="h-3.5 w-3.5" /> Lihat lokasi
              </a>
            </div>

            <div v-if="log.note" class="mt-1 text-[12px] italic text-slate-500">"{{ log.note }}"</div>
          </div>

          <a
            v-if="log.image"
            :href="log.image"
            target="_blank"
            rel="noopener"
            class="flex-shrink-0"
            title="Lihat foto"
          >
            <img :src="log.image" alt="Bukti absensi" class="h-14 w-14 rounded-lg border border-mahir-border object-cover" />
          </a>
          <div
            v-else
            class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-mahir-border text-slate-300"
          >
            <PhotoIcon class="h-5 w-5" />
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
