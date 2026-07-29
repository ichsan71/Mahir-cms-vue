<script setup>
import { onMounted } from "vue";
import { useAttendanceHistory } from "../composables/useAttendanceHistory";
import { useAttendanceHistoryFiltersStore } from "../stores/attendanceHistoryFilters.store";
import AttendanceHistoryToolbar from "./AttendanceHistoryToolbar.vue";
import AttendanceHistoryTable from "./AttendanceHistoryTable.vue";

const { histories, pagination, statusOptions, loading, nextPage, prevPage } =
  useAttendanceHistory();

const filters = useAttendanceHistoryFiltersStore();

// Panel dipasang (mis. pindah tab): mulai dari halaman 1.
onMounted(() => filters.setPage(1));
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Riwayat Kehadiran
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ histories.length }}</span>
      </h2>
      <AttendanceHistoryToolbar :status-options="statusOptions" />
    </div>

    <AttendanceHistoryTable :histories="histories" :loading="loading" />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ histories.length }} snapshot</span
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
