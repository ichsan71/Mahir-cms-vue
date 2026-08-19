<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useEmployeeFiltersStore } from "../stores/employeeFilters.store";
import { MagnifyingGlassIcon, ShareIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

const emit = defineEmits(["export"]);

const auth = useAuthStore();
const filters = useEmployeeFiltersStore();

// Input lokal sebagai penampung sementara: pengetikan tidak langsung memicu
// query. Nilai baru baru di-commit ke store setelah jeda (debounce) sehingga
// jumlah request berkurang.
const localSearch = ref(filters.search);
const localUnitsName = ref(filters.unitsName);

let timeoutId = null;

function commit() {
  filters.search = localSearch.value;
  filters.unitsName = localUnitsName.value;
  // Reset ke halaman 1 ditangani composable saat filter berubah.
}

function debouncedCommit() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(commit, 400);
}

watch([localSearch, localUnitsName], debouncedCommit);
onUnmounted(() => clearTimeout(timeoutId));

// Sinkron balik bila store di-reset dari luar (mis. tombol Reset).
watch(
  () => [filters.search, filters.unitsName],
  ([s, u]) => {
    if (s !== localSearch.value) localSearch.value = s;
    if (u !== localUnitsName.value) localUnitsName.value = u;
  },
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Pencarian umum (nama / NIK) -->
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari nama, NIK..."
        class="w-[200px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <!-- Filter unit -->
    <div class="relative">
      <ShareIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localUnitsName"
        type="text"
        placeholder="Filter unit..."
        class="w-[160px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <!-- Export -->
    <button
      v-if="auth.can(PERM.EXPORT)"
      type="button"
      class="flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      @click="emit('export')"
    >
      <ArrowDownTrayIcon class="h-4 w-4" /> Ekspor
    </button>
  </div>
</template>
