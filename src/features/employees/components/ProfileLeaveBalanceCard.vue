<script setup>
// Saldo cuti pada halaman "Profil Saya". Read-only & presentational: datanya
// berasal dari field nested `getEmployee.leaveBalances` (query GET_MY_PROFILE),
// bukan query listLeaveBalance yang di-gate permission. Tidak fetch sendiri —
// menerima objek paginasi lewat prop & memancarkan next/prev ke induk.
import { computed } from "vue";
import ProfileSectionPagination from "./ProfileSectionPagination.vue";
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  // leaveBalances dari GET_MY_PROFILE: { results, count, currentPage, ... }
  paginate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

defineEmits(["next", "prev"]);

const rows = computed(() => props.paginate?.results ?? []);
const pagination = computed(() => {
  const count = props.paginate?.count ?? 0;
  return {
    count,
    currentPage: props.paginate?.currentPage ?? 1,
    totalPages: props.paginate?.totalPages ?? Math.max(1, Math.ceil(count / 10)),
    hasNext: props.paginate?.hasNext ?? false,
    hasPrev: props.paginate?.hasPrev ?? false,
  };
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <CalendarDaysIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Saldo Cuti</h2>
        <p class="text-[11.5px] text-slate-400">{{ pagination.count }} saldo</p>
      </div>
    </div>

    <div class="p-5">
      <!-- Loading -->
      <div v-if="loading && !rows.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat saldo cuti…
      </div>

      <!-- Kosong -->
      <div v-else-if="!rows.length" class="py-10 text-center text-sm text-slate-400">
        Belum ada saldo cuti untuk Anda.
      </div>

      <!-- Tabel saldo -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-mahir-border text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th class="py-2.5 pr-4 font-semibold">Tipe Cuti</th>
              <th class="py-2.5 pr-4 font-semibold">Tahun</th>
              <th class="py-2.5 pr-4 font-semibold text-right">Kuota</th>
              <th class="py-2.5 pr-4 font-semibold text-right">Terpakai</th>
              <th class="py-2.5 font-semibold text-right">Sisa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in rows" :key="b.id" class="border-b border-mahir-border/60 last:border-0">
              <td class="py-3 pr-4 font-medium text-slate-800">{{ b.leaveType?.name ?? "-" }}</td>
              <td class="py-3 pr-4 text-slate-600">{{ b.year }}</td>
              <td class="py-3 pr-4 text-right text-slate-600">{{ b.allocated }}</td>
              <td class="py-3 pr-4 text-right text-slate-600">{{ b.used }}</td>
              <td class="py-3 text-right font-semibold text-slate-800">{{ b.remaining }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ProfileSectionPagination
      :pagination="pagination"
      :shown="rows.length"
      unit-label="saldo"
      @next="$emit('next')"
      @prev="$emit('prev')"
    />
  </div>
</template>
