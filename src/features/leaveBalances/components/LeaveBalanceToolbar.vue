<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useLeaveBalanceFiltersStore } from "../stores/leaveBalanceFilters.store";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const filters = useLeaveBalanceFiltersStore();
const localSearch = ref(filters.search);

// Pilihan tahun: beberapa tahun terakhir + tahun depan.
const yearOptions = computed(() => {
  const now = new Date().getFullYear();
  const list = [];
  for (let y = now + 1; y >= now - 4; y--) list.push(y);
  return list;
});

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
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari karyawan / tipe cuti..."
        class="w-[240px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <select
      v-model="filters.year"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
    >
      <option value="">Semua Tahun</option>
      <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>
