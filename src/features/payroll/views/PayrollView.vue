<script setup>
// Port dari resources/views/pages/payroll/index.blade.php + modules/payroll.js
import { usePayroll } from "../composables/usePayroll";
import PageHeader from "@/shared/components/PageHeader.vue";
import StatsCard from "@/shared/components/StatsCard.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import SearchInput from "@/shared/components/SearchInput.vue";
import { formatCurrency } from "@/shared/utils/format";
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";
import { PlayCircleIcon } from "@heroicons/vue/24/solid";

const { filters, payrolls, stats, loading, process, processAll } = usePayroll();
</script>

<template>
  <PageHeader title="Manajemen Penggajian" subtitle="Rekapitulasi & pemrosesan gaji karyawan — Periode April 2026">
    <template #actions>
      <button class="flex items-center gap-2 rounded-lg border border-mahir-border bg-white px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50">
        <DocumentArrowDownIcon class="h-4 w-4" /> Ekspor CSV
      </button>
      <button
        class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
        @click="processAll"
      >
        <PlayCircleIcon class="h-4 w-4" /> Proses Semua
      </button>
    </template>
  </PageHeader>

  <!-- Stats -->
  <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatsCard :value="stats ? formatCurrency(stats.totalNet) : '—'" label="Total Penggajian" :icon="BanknotesIcon" color="#243B8F" bg-color="#E7EEFF" />
    <StatsCard :value="stats ? formatCurrency(stats.paidNet) : '—'" label="Total Terbayar" :icon="CheckCircleIcon" color="#1B9C67" bg-color="#E2F8EC" />
    <StatsCard :value="stats?.countPaid ?? '—'" label="Sudah Diproses" :icon="CheckBadgeIcon" color="#1B9C67" bg-color="#E2F8EC" />
    <StatsCard :value="stats?.countPending ?? '—'" label="Belum Diproses" :icon="ClockIcon" color="#D98E18" bg-color="#FFF3DA" />
  </div>

  <!-- Table -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">Daftar Slip Gaji — April 2026</h2>
      <div class="flex flex-wrap items-center gap-2">
        <SearchInput v-model="filters.search" placeholder="Cari karyawan..." />
        <select v-model="filters.status" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Belum Bayar</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="px-4 py-3 font-semibold">ID Slip</th>
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Periode</th>
            <th class="px-4 py-3 font-semibold">Gaji Pokok</th>
            <th class="px-4 py-3 font-semibold">Tunjangan</th>
            <th class="px-4 py-3 font-semibold">Potongan</th>
            <th class="px-4 py-3 font-semibold">Gaji Bersih</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Tgl Bayar</th>
            <th class="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!payrolls.length">
            <td colspan="10" class="px-4 py-8 text-center text-slate-400">
              {{ loading ? "Memuat data…" : "Tidak ada slip gaji." }}
            </td>
          </tr>
          <tr v-for="p in payrolls" :key="p.id" class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60">
            <td class="px-4 py-3"><code class="text-xs text-slate-500">{{ p.id }}</code></td>
            <td class="px-4 py-3">
              <div class="font-semibold text-slate-800">{{ p.emp }}</div>
              <div class="text-[11.5px] text-slate-400">{{ p.dept }}</div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ p.period }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatCurrency(p.basic) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatCurrency(p.allowance) }}</td>
            <td class="px-4 py-3 text-mahir-danger">-{{ formatCurrency(p.deduction) }}</td>
            <td class="px-4 py-3 font-bold text-slate-800">{{ formatCurrency(p.net) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="p.status" /></td>
            <td class="px-4 py-3 text-slate-600">{{ p.date }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" title="Lihat Slip">
                  <DocumentTextIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="p.status !== 'paid'"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-primary text-white hover:bg-mahir-primary/90"
                  title="Proses"
                  @click="process(p.id)"
                >
                  <CheckCircleIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-mahir-border px-5 py-3 text-[13px] text-mahir-muted">
      {{ payrolls.length }} slip gaji
    </div>
  </div>
</template>
