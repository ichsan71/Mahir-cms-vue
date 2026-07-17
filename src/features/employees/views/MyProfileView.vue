<script setup>
// Halaman "Profil Saya" — data karyawan milik user yang login (getEmployee
// berdasarkan id-nya sendiri). Dirender di dalam AppLayout (sidebar + navbar),
// jadi cukup konten kartunya saja.
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEmployeeDetail } from "../composables/useEmployeeDetail";
import EmployeeProfileCard from "../components/EmployeeProfileCard.vue";
import { ArrowPathIcon, UserMinusIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();

// Id karyawan dari sesi login. Bila akun tak tertaut employee, id null → query
// tidak dijalankan dan tampil state "tidak ditemukan".
const employeeId = computed(() => auth.employee?.id ?? null);
const { employee, loading } = useEmployeeDetail(employeeId);
</script>

<template>
  <div class="mb-5">
    <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>
    <p class="text-sm text-mahir-muted">
      Selamat datang, {{ auth.displayName }}. Berikut data kepegawaian Anda.
    </p>
  </div>

  <div v-if="loading && !employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <ArrowPathIcon class="h-7 w-7 animate-spin text-mahir-primary mb-3" />
    <p class="text-sm font-medium text-slate-500">Memuat data Anda...</p>
  </div>

  <div v-else-if="!employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <UserMinusIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data karyawan Anda tidak ditemukan</p>
    <p class="text-xs text-slate-400 mt-1">Akun Anda mungkin belum tertaut ke data karyawan. Hubungi super admin.</p>
  </div>

  <EmployeeProfileCard v-else :employee="employee" />
</template>
