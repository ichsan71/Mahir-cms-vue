<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAttendance } from "../composables/useAttendance";
import { useAttendanceFiltersStore } from "../stores/attendanceFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import AttendanceToolbar from "./AttendanceToolbar.vue";
import AttendanceTable from "./AttendanceTable.vue";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // "self" = kehadiran diri sendiri (employeeId); "team" = kehadiran tim (employeeIds).
  scope: { type: String, default: "self" },
});

const { records, summary, pagination, loading, nextPage, prevPage } = useAttendance(props.scope);

const filters = useAttendanceFiltersStore();
const { teamMemberId } = storeToRefs(filters);
const auth = useAuthStore();

// Anggota tim (bawahan) untuk chip pemilih — hanya relevan di tab "Kehadiran Tim".
const subordinates = computed(() => auth.subordinates);
// "Semua" (teamMemberId kosong) → list dikelompokkan per karyawan; satu anggota → list datar.
const isGrouped = computed(() => props.scope === "team" && !teamMemberId.value);

// Panel dipasang (mis. pindah tab): mulai dari halaman 1 & reset pilihan anggota ke "Semua".
onMounted(() => {
  filters.setPage(1);
  if (props.scope === "team") teamMemberId.value = "";
});

// Ringkasan status (dihitung dari baris yang sedang tampil di halaman ini).
const cards = [
  { key: "ontime", label: "Tepat Waktu", icon: CheckCircleIcon, cls: "bg-mahir-success-soft text-mahir-success" },
  { key: "late", label: "Terlambat", icon: ClockIcon, cls: "bg-mahir-warning-soft text-mahir-warning" },
  { key: "absent", label: "Tidak Hadir", icon: XCircleIcon, cls: "bg-mahir-danger-soft text-mahir-danger" },
  { key: "leave", label: "Cuti/Izin", icon: CalendarDaysIcon, cls: "bg-mahir-info-soft text-mahir-info" },
];
</script>

<template>
  <!-- Pemilih anggota tim (tab Kehadiran Tim) -->
  <div v-if="scope === 'team' && subordinates.length" class="mb-5 flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
      :class="!teamMemberId
        ? 'border-mahir-primary bg-mahir-primary text-white'
        : 'border-mahir-border bg-white text-slate-600 hover:border-mahir-primary/40'"
      @click="teamMemberId = ''"
    >
      Semua
    </button>
    <button
      v-for="m in subordinates"
      :key="m.id"
      type="button"
      class="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
      :class="String(teamMemberId) === String(m.id)
        ? 'border-mahir-primary bg-mahir-primary text-white'
        : 'border-mahir-border bg-white text-slate-600 hover:border-mahir-primary/40'"
      @click="teamMemberId = m.id"
    >
      {{ m.fullName || `#${m.id}` }}
    </button>
  </div>

  <!-- Ringkasan status (halaman ini) -->
  <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <div
      v-for="c in cards"
      :key="c.key"
      class="flex items-center gap-3 rounded-2xl border border-mahir-border bg-white p-4 shadow-sm"
    >
      <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" :class="c.cls">
        <component :is="c.icon" class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <div class="text-2xl font-bold leading-tight text-slate-900">{{ summary[c.key] }}</div>
        <div class="text-[12.5px] text-mahir-muted">{{ c.label }}</div>
      </div>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Catatan Kehadiran
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <AttendanceToolbar />
    </div>

    <AttendanceTable :records="records" :loading="loading" :grouped="isGrouped" />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ records.length }} dari {{ pagination.count }} catatan</span
      >
      <nav class="flex items-center gap-1">
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasPrev"
          @click="prevPage"
        >
          ‹
        </button>
        <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
          {{ pagination.currentPage }}
        </span>
        <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasNext"
          @click="nextPage"
        >
          ›
        </button>
      </nav>
    </div>
  </div>
</template>
