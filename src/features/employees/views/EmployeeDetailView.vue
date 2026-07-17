<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployeeDetail } from "../composables/useEmployeeDetail";
import EmployeeProfileCard from "../components/EmployeeProfileCard.vue";
import { ArrowLeftIcon, ArrowPathIcon, UserMinusIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { employee, loading } = useEmployeeDetail(id);

function goBack() {
  router.push({ name: "karyawan" });
}
</script>

<template>
  <div class="mb-5 flex items-center justify-between">
    <button
      class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mahir-muted hover:text-slate-900 transition-colors"
      @click="goBack"
    >
      <ArrowLeftIcon class="h-4 w-4" /> Kembali
    </button>
  </div>

  <div v-if="loading && !employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <ArrowPathIcon class="h-7 w-7 animate-spin text-mahir-primary mb-3" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data karyawan...</p>
  </div>

  <div v-else-if="!employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <UserMinusIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data karyawan tidak ditemukan</p>
    <p class="text-xs text-slate-400 mt-1">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <EmployeeProfileCard v-else :employee="employee" />
</template>
