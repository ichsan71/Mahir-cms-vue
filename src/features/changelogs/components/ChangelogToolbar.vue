<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useChangelogFiltersStore } from "../stores/changelogFilters.store";
import { useInfraChoices } from "@/shared/composables/useInfraChoices";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const filters = useChangelogFiltersStore();

// Pencarian judul/deskripsi (debounced).
const localSearch = ref(filters.search);
let timeoutId = null;
watch(localSearch, () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => (filters.search = localSearch.value), 400);
});
onUnmounted(() => clearTimeout(timeoutId));
watch(
  () => filters.search,
  (t) => {
    if (t !== localSearch.value) localSearch.value = t;
  },
);

// Pilihan filter dari infraChoices. appName dikunci ke "Mahir" (tanpa dropdown).
const { options: changeTypeOptions, loading: changeTypeLoading } = useInfraChoices("CHANGE_TYPE");
const { options: platformOptions, loading: platformLoading } = useInfraChoices("DEVICE_PLATFORM");
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari judul..."
        class="w-[200px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <select
      v-model="filters.changeType"
      :disabled="changeTypeLoading"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
    >
      <option value="">Semua tipe</option>
      <option v-for="o in changeTypeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>

    <select
      v-model="filters.platform"
      :disabled="platformLoading"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
    >
      <option value="">Semua platform</option>
      <option v-for="o in platformOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </div>
</template>
