<script setup>
import { ref, watch, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import { useAnnouncementFiltersStore } from "../stores/announcementFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useUnitSearch } from "@/features/units/composables/useUnitSearch";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { PERM } from "../permissions";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const filters = useAnnouncementFiltersStore();

// Pencarian judul (debounced).
const localTitle = ref(filters.title);
let timeoutId = null;
watch(localTitle, () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => (filters.title = localTitle.value), 400);
});
onUnmounted(() => clearTimeout(timeoutId));
watch(
  () => filters.title,
  (t) => {
    if (t !== localTitle.value) localTitle.value = t;
  },
);

// Status (enum) + filter tujuan (company/unit).
const { options: statusOptions, loading: statusLoading } = useEnumChoices("ANNOUNCEMENT_STATUS");
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } = useCompanySearch();
const { options: unitOptions, loading: unitLoading, setSearch: setUnitSearch } = useUnitSearch();
const companySelected = ref([]);
const unitSelected = ref([]);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localTitle"
        type="text"
        placeholder="Cari judul..."
        class="w-[200px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <select
      v-model="filters.status"
      :disabled="statusLoading"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
    >
      <option value="">Semua status</option>
      <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>

    <div class="w-[190px]">
      <SearchableSelect
        v-model="filters.companyIds"
        multiple
        :selected="companySelected"
        :options="companyOptions"
        :loading="companyLoading"
        placeholder="Perusahaan"
        search-placeholder="Cari perusahaan…"
        @search="setCompanySearch"
      />
    </div>

    <div class="w-[190px]">
      <SearchableSelect
        v-model="filters.unitIds"
        multiple
        :selected="unitSelected"
        :options="unitOptions"
        :loading="unitLoading"
        placeholder="Unit"
        search-placeholder="Cari unit…"
        @search="setUnitSearch"
      />
    </div>

    <RouterLink
      v-if="auth.can(PERM.CREATE)"
      to="/pengumuman/buat"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
    >
      <PlusIcon class="h-4 w-4" /> Buat Pengumuman
    </RouterLink>
  </div>
</template>
