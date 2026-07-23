<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useLeaveMandatoryApproverFiltersStore } from "../stores/leaveMandatoryApproverFilters.store";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const filters = useLeaveMandatoryApproverFiltersStore();
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
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari perusahaan / unit..."
        class="w-[240px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>
  </div>
</template>
