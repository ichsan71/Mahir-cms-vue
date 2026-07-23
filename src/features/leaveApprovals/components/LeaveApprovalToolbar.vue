<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useLeaveApprovalFiltersStore } from "../stores/leaveApprovalFilters.store";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const filters = useLeaveApprovalFiltersStore();
const localSearch = ref(filters.search);

// Pilihan status dari enum backend (LeaveApprovalStatusChoices).
const { options: statusOptions, loading: statusLoading } = useEnumChoices("LeaveApprovalStatusChoices");

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
        placeholder="Cari pengajuan..."
        class="w-[220px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <select
      v-model="filters.status"
      :disabled="statusLoading"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
    >
      <option value="">Semua Status</option>
      <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>
  </div>
</template>
