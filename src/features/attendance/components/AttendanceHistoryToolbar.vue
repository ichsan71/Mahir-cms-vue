<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useAttendanceHistoryFiltersStore } from "../stores/attendanceHistoryFilters.store";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/outline";

defineProps({
  // Opsi status (diturunkan dari data) untuk dropdown filter.
  statusOptions: { type: Array, default: () => [] },
});

const filters = useAttendanceHistoryFiltersStore();
const localSearch = ref(filters.search);

let timeoutId = null;
function debouncedCommit() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    filters.search = localSearch.value;
  }, 400);
}

watch(localSearch, debouncedCommit);
onUnmounted(() => clearTimeout(timeoutId));

watch(
  () => filters.search,
  (s) => {
    if (s !== localSearch.value) localSearch.value = s;
  },
);

function clearDates() {
  filters.snapshotDateGte = "";
  filters.snapshotDateLte = "";
}

// Label status dipercantik: "not_present" → "Not Present".
function statusLabel(s) {
  return String(s)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari karyawan..."
        class="w-[200px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <!-- Filter status (opsi mengikuti data yang termuat) -->
    <select
      v-if="statusOptions.length"
      v-model="filters.status"
      class="rounded-lg border border-mahir-border py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      aria-label="Filter status"
    >
      <option value="">Semua status</option>
      <option v-for="s in statusOptions" :key="s" :value="s">{{ statusLabel(s) }}</option>
    </select>

    <!-- Rentang tanggal snapshot -->
    <div class="flex items-center gap-1.5 rounded-lg border border-mahir-border px-2.5 py-1.5">
      <input
        v-model="filters.snapshotDateGte"
        type="date"
        class="bg-transparent text-sm text-slate-700 focus:outline-none"
        aria-label="Dari tanggal"
      />
      <span class="text-slate-400">–</span>
      <input
        v-model="filters.snapshotDateLte"
        type="date"
        class="bg-transparent text-sm text-slate-700 focus:outline-none"
        aria-label="Sampai tanggal"
      />
      <button
        v-if="filters.snapshotDateGte || filters.snapshotDateLte"
        type="button"
        class="ml-0.5 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        title="Hapus rentang tanggal"
        @click="clearDates"
      >
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
