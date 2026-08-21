<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";
import AttendanceCheckModal from "./AttendanceCheckModal.vue";
import { useTodayAttendance } from "../composables/useTodayAttendance";

// Status absen hari ini (masuk/pulang, telat/pulang cepat).
const {
  loading: todayLoading,
  refetch: refetchToday,
  hasCheckedIn,
  hasCheckedOut,
  checkInAt,
  checkOutAt,
  isLate,
  lateMinutes,
  isEarlyLeave,
  earlyLeaveMinutes,
  holiday,
  scheduledIn,
  scheduledOut,
} = useTodayAttendance();

// Modal absen: dibuka dengan tipe "IN" (check-in) atau "OUT" (check-out).
const modalOpen = ref(false);
const modalType = ref("IN");

function openCheck(type) {
  modalType.value = type;
  modalOpen.value = true;
}

// Setelah absen sukses → segarkan status hari ini.
function onSubmitted() {
  refetchToday();
}

// Jam berjalan (HH:MM:SS) & tanggal untuk header kartu.
const now = ref(new Date());
let timer = null;
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});
onUnmounted(() => clearInterval(timer));

// Format manual agar pemisah pakai ":" (locale id-ID memakai "." → 14.30.05).
function fmtTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtDate(d) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <!-- Jam & tanggal -->
      <div>
        <div class="text-3xl font-bold leading-none tabular-nums text-slate-900">
          {{ fmtTime(now) }}
        </div>
        <p class="mt-1.5 text-[13px] capitalize text-mahir-muted">{{ fmtDate(now) }}</p>
        <div class="mt-2 flex items-center gap-1.5 text-[12px] text-slate-400">
          <MapPinIcon class="h-3.5 w-3.5" />
          <span>Absen memakai lokasi GPS &amp; harus di area kantor</span>
        </div>
      </div>

      <!-- Aksi absen -->
      <div class="grid grid-cols-2 gap-2.5 sm:w-72">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-mahir-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mahir-primary/90"
          @click="openCheck('IN')"
        >
          <ArrowRightEndOnRectangleIcon class="h-4 w-4" />
          Check In
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-mahir-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          @click="openCheck('OUT')"
        >
          <ArrowLeftStartOnRectangleIcon class="h-4 w-4" />
          Check Out
        </button>
      </div>
    </div>

    <!-- Status absen hari ini -->
    <div class="border-t border-mahir-border px-5 py-4">
      <!-- Hari libur -->
      <div
        v-if="holiday"
        class="flex items-center gap-2 rounded-xl border border-mahir-info-soft bg-mahir-info-soft/40 px-3.5 py-3 text-[13px] font-medium text-mahir-info"
      >
        <CalendarDaysIcon class="h-4 w-4 flex-shrink-0" />
        Hari libur: {{ holiday.name }}
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <!-- Masuk -->
        <div class="rounded-xl border border-mahir-border p-3.5">
          <div class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <ArrowRightEndOnRectangleIcon class="h-3.5 w-3.5" />
            Masuk
          </div>
          <div class="mt-1 text-xl font-bold tabular-nums text-slate-900">
            {{ hasCheckedIn ? checkInAt : "—" }}
          </div>
          <div class="mt-1.5">
            <span
              v-if="!hasCheckedIn"
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
            >
              {{ todayLoading ? "Memuat…" : "Belum absen masuk" }}
            </span>
            <span
              v-else-if="isLate"
              class="inline-flex items-center gap-1 rounded-full bg-mahir-danger-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-danger"
            >
              <ClockIcon class="h-3 w-3" /> Telat {{ lateMinutes }} mnt
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-mahir-success-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-success"
            >
              <CheckCircleIcon class="h-3 w-3" /> Tepat waktu
            </span>
          </div>
          <p v-if="scheduledIn" class="mt-1.5 text-[11px] text-slate-400">Jadwal {{ scheduledIn }}</p>
        </div>

        <!-- Pulang -->
        <div class="rounded-xl border border-mahir-border p-3.5">
          <div class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <ArrowLeftStartOnRectangleIcon class="h-3.5 w-3.5" />
            Pulang
          </div>
          <div class="mt-1 text-xl font-bold tabular-nums text-slate-900">
            {{ hasCheckedOut ? checkOutAt : "—" }}
          </div>
          <div class="mt-1.5">
            <span
              v-if="!hasCheckedOut"
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
            >
              {{ todayLoading ? "Memuat…" : "Belum absen pulang" }}
            </span>
            <span
              v-else-if="isEarlyLeave"
              class="inline-flex items-center gap-1 rounded-full bg-mahir-warning-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-warning"
            >
              <ClockIcon class="h-3 w-3" /> Pulang cepat {{ earlyLeaveMinutes }} mnt
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-mahir-success-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-success"
            >
              <CheckCircleIcon class="h-3 w-3" /> Tepat waktu
            </span>
          </div>
          <p v-if="scheduledOut" class="mt-1.5 text-[11px] text-slate-400">Jadwal {{ scheduledOut }}</p>
        </div>
      </div>
    </div>

    <AttendanceCheckModal v-model:open="modalOpen" :type="modalType" @submitted="onSubmitted" />
  </div>
</template>
