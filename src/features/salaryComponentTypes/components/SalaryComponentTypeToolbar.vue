<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useSalaryComponentTypeFiltersStore } from "../stores/salaryComponentTypeFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { CATEGORIES } from "../constants";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["add"]);

const auth = useAuthStore();
const filters = useSalaryComponentTypeFiltersStore();
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

const fieldCls =
  "rounded-lg border border-mahir-border py-2 px-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari komponen..."
        :class="[fieldCls, 'w-[200px] pl-9']"
      />
    </div>

    <select v-model="filters.category" :class="fieldCls">
      <option value="">Semua kategori</option>
      <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
    </select>

    <button
      v-if="auth.can(PERM.CREATE)"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
      @click="emit('add')"
    >
      <PlusIcon class="h-4 w-4" /> Tambah Komponen
    </button>
  </div>
</template>
