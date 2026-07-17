<script setup>
// Halaman 403: ditampilkan saat user membuka rute yang tak diizinkan permission-nya.
import { RouterLink } from "vue-router";
import { NoSymbolIcon } from "@heroicons/vue/24/outline";
</script>

<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
      <NoSymbolIcon class="h-10 w-10 text-red-500" />
    </div>
    <h1 class="mt-6 text-3xl font-bold text-slate-900">403</h1>
    <p class="mt-2 text-lg font-semibold text-slate-700">Akses Ditolak</p>
    <p class="mt-1 max-w-md text-sm text-mahir-muted">
      Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator
      jika menurut Anda ini adalah kekeliruan.
    </p>
    <RouterLink
      to="/dashboard"
      class="mt-6 rounded-lg bg-mahir-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
    >
      Kembali ke Dashboard
    </RouterLink>
  </div>
</template>
