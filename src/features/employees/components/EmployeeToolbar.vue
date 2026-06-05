<script setup>
import { storeToRefs } from "pinia";
import { useEmployeeFiltersStore } from "../stores/employeeFilters.store";
import { DEPARTMENTS } from "../constants";

const filters = useEmployeeFiltersStore();
const { search, dept, status } = storeToRefs(filters);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Search -->
    <div class="relative">
      <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
      <input
        v-model="search"
        type="text"
        placeholder="Cari nama, ID..."
        class="w-[200px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <!-- Dept filter -->
    <select
      v-model="dept"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none"
    >
      <option value="">Semua Dept</option>
      <option v-for="d in DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
    </select>

    <!-- Status filter -->
    <select
      v-model="status"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none"
    >
      <option value="">Semua Status</option>
      <option value="active">Aktif</option>
      <option value="inactive">Non-Aktif</option>
    </select>

    <!-- Export -->
    <button
      class="flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <i class="bi bi-download"></i> Ekspor
    </button>
  </div>
</template>
