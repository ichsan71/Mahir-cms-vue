<script setup>
// Kartu ringkasan kehadiran (Hadir/Terlambat/Tidak Hadir/Cuti). Presentasional:
// hanya menerima objek `summary` dan menampilkannya. Dipakai bersama oleh tab
// Kalender & tab Daftar agar tampilan + kategori identik.
import { ATTENDANCE_SUMMARY_CARDS as cards } from "../summary";

defineProps({
  // { hadir, terlambat, tidakHadir, cuti }
  summary: { type: Object, default: () => ({}) },
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    <div
      v-for="c in cards"
      :key="c.key"
      class="flex items-center gap-3 rounded-2xl border border-mahir-border bg-white p-4 shadow-sm"
    >
      <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" :class="c.cls">
        <component :is="c.icon" class="h-5 w-5" />
      </div>
      <div class="min-w-0">
        <div class="text-2xl font-bold leading-tight text-slate-900">{{ summary[c.key] ?? 0 }}</div>
        <div class="text-[12.5px] text-mahir-muted">{{ c.label }}</div>
      </div>
    </div>
  </div>
</template>
