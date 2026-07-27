<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useAttendanceFiltersStore } from "../stores/attendanceFilters.store";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const filters = useAttendanceFiltersStore();
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
  filters.dateGte = "";
  filters.dateLte = "";
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
        class="w-[220px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <!-- Rentang tanggal -->
    <div class="flex items-center gap-1.5 rounded-lg border border-mahir-border px-2.5 py-1.5">
      <input
        v-model="filters.dateGte"
        type="date"
        class="bg-transparent text-sm text-slate-700 focus:outline-none"
        aria-label="Dari tanggal"
      />
      <span class="text-slate-400">–</span>
      <input
        v-model="filters.dateLte"
        type="date"
        class="bg-transparent text-sm text-slate-700 focus:outline-none"
        aria-label="Sampai tanggal"
      />
      <button
        v-if="filters.dateGte || filters.dateLte"
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
