<script setup>
// Port dari resources/views/pages/attendance/index.blade.php + modules/attendance.js
import { useAttendance } from "../composables/useAttendance";
import PageHeader from "@/shared/components/PageHeader.vue";
import StatsCard from "@/shared/components/StatsCard.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import SearchInput from "@/shared/components/SearchInput.vue";
import { initials } from "@/shared/utils/format";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";

const { filters, records, stats, loading } = useAttendance();
</script>

<template>
  <PageHeader title="Monitoring Kehadiran" subtitle="Log absensi harian karyawan — Kamis, 24 April 2026">
    <template #actions>
      <input type="date" value="2026-04-24" class="rounded-lg border border-mahir-border px-3 py-2 text-[13.5px] text-slate-700 focus:border-mahir-primary focus:outline-none" />
      <button class="flex items-center gap-2 rounded-lg border border-mahir-border bg-white px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50">
        <ArrowDownTrayIcon class="h-4 w-4" /> Ekspor
      </button>
    </template>
  </PageHeader>

  <!-- Stats -->
  <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatsCard :value="stats?.ontime ?? '—'" label="Tepat Waktu" :icon="CheckCircleIcon" color="#1B9C67" bg-color="#E2F8EC" />
    <StatsCard :value="stats?.late ?? '—'" label="Terlambat" :icon="ClockIcon" color="#D98E18" bg-color="#FFF3DA" />
    <StatsCard :value="stats?.absent ?? '—'" label="Tidak Hadir" :icon="XCircleIcon" color="#D14343" bg-color="#FCE7E7" />
    <StatsCard :value="stats?.leave ?? '—'" label="Cuti/Izin" :icon="CalendarDaysIcon" color="#2884E8" bg-color="#E4F1FF" />
  </div>

  <!-- Table -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">Log Absensi Hari Ini</h2>
      <div class="flex flex-wrap items-center gap-2">
        <SearchInput v-model="filters.search" placeholder="Cari karyawan..." />
        <select v-model="filters.status" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Status</option>
          <option value="ontime">Tepat Waktu</option>
          <option value="late">Terlambat</option>
          <option value="absent">Tidak Hadir</option>
          <option value="leave">Cuti/Izin</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="w-10 px-4 py-3 font-semibold">#</th>
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Tanggal</th>
            <th class="px-4 py-3 font-semibold">Jam Masuk</th>
            <th class="px-4 py-3 font-semibold">Jam Keluar</th>
            <th class="px-4 py-3 font-semibold">Total Jam</th>
            <th class="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!records.length">
            <td colspan="7" class="px-4 py-8 text-center text-slate-400">
              {{ loading ? "Memuat data…" : "Tidak ada catatan." }}
            </td>
          </tr>
          <tr v-for="(a, i) in records" :key="a.id" class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60">
            <td class="px-4 py-3 text-slate-500">{{ i + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary">{{ initials(a.emp) }}</span>
                <div>
                  <div class="text-[13.5px] font-semibold text-slate-800">{{ a.emp }}</div>
                  <div class="text-[11.5px] text-slate-400">{{ a.dept }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ a.date }}</td>
            <td class="px-4 py-3" :class="a.checkIn === '—' ? 'text-slate-400' : 'font-semibold text-slate-800'">{{ a.checkIn }}</td>
            <td class="px-4 py-3" :class="a.checkOut === '—' ? 'text-slate-400' : 'font-semibold text-slate-800'">{{ a.checkOut }}</td>
            <td class="px-4 py-3 text-slate-600">{{ a.hours }}</td>
            <td class="px-4 py-3"><StatusBadge :status="a.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-mahir-border px-5 py-3 text-[13px] text-mahir-muted">
      {{ records.length }} catatan kehadiran
    </div>
  </div>
</template>
