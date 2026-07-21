<script setup>
// Port dari resources/views/pages/dashboard.blade.php
import { useDashboard } from "../composables/useDashboard";
import StatsCard from "@/shared/components/StatsCard.vue";
import AttendanceChart from "../components/AttendanceChart.vue";
import DeptDistributionChart from "../components/DeptDistributionChart.vue";
import ActivityFeed from "../components/ActivityFeed.vue";
import PendingLeavesTable from "../components/PendingLeavesTable.vue";
import EmployeeStructureCard from "../components/EmployeeStructureCard.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "@/features/employees/permissions";
import {
  ClockIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronDownIcon,
  UsersIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from "@heroicons/vue/24/outline";

const auth = useAuthStore();

const {
  stats,
  attendanceWeekly,
  deptDistribution,
  activities,
  pendingLeaves,
  approveLeave,
  rejectLeave,
} = useDashboard();
</script>

<template>
  <!-- Page header -->
  <!-- <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-sm text-mahir-muted">
        Selamat datang kembali, Admin — Kamis, 24 April 2026
      </p>
    </div>
    <div class="flex gap-2">
      <button
        class="flex items-center gap-2 rounded-lg border border-mahir-border bg-white px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50"
      >
        <ArrowDownTrayIcon class="h-4 w-4" /> Ekspor
      </button>
      <button
        class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
      >
        <PlusIcon class="h-4 w-4" /> Tambah Karyawan
      </button>
    </div>
  </div> -->

  <!-- Stats row -->
  <!-- <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatsCard
      :value="stats?.totalEmployees ?? '—'"
      label="Total Karyawan"
      :icon="UsersIcon"
      color="#243B8F"
      bg-color="#E7EEFF"
      :delta="stats?.employeesDelta"
      delta-dir="up"
    />
    <StatsCard
      :value="stats?.presentToday ?? '—'"
      label="Hadir Hari Ini"
      :icon="CalendarDaysIcon"
      color="#1B9C67"
      bg-color="#E2F8EC"
      :delta="stats ? `dari ${stats.totalHeadcount} karyawan` : null"
      delta-dir="up"
    />
    <StatsCard
      :value="stats?.pendingLeaves ?? '—'"
      label="Cuti Menunggu"
      :icon="DocumentTextIcon"
      color="#D98E18"
      bg-color="#FFF3DA"
    />
    <StatsCard
      :value="stats?.pendingPayroll ?? '—'"
      label="Payroll Pending"
      :icon="BanknotesIcon"
      color="#D14343"
      bg-color="#FCE7E7"
    />
  </div> -->

  <!-- Charts row -->
  <!-- <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="rounded-2xl border border-mahir-border bg-white p-5 lg:col-span-2">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Kehadiran Minggu Ini</h2>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">21 – 25 Apr 2026</span>
          <button
            class="rounded-lg border border-mahir-border bg-white px-2.5 py-1 text-xs text-slate-600"
          >
            Minggu ini <ChevronDownIcon class="ml-1 inline h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <AttendanceChart :data="attendanceWeekly" />
    </div>

    <div class="rounded-2xl border border-mahir-border bg-white p-5">
      <h2 class="mb-4 font-semibold text-slate-900">Distribusi Departemen</h2>
      <DeptDistributionChart :data="deptDistribution" />
    </div>
  </div> -->

  <!-- Bottom row -->
  <!-- <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div class="rounded-2xl border border-mahir-border bg-white p-5 lg:col-span-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Aktivitas Terbaru</h2>
        <a href="#" class="text-xs font-medium text-mahir-primary">Lihat semua</a>
      </div>
      <ActivityFeed :items="activities" />
    </div>

    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white lg:col-span-7">
      <div class="flex items-center justify-between p-5 pb-3">
        <h2 class="font-semibold text-slate-900">Pengajuan Cuti Menunggu</h2>
        <a href="#" class="text-xs font-medium text-mahir-primary">Kelola semua</a>
      </div>
      <PendingLeavesTable
        :leaves="pendingLeaves"
        @approve="approveLeave"
        @reject="rejectLeave"
      />
    </div>
  </div> -->
  
  <!-- Punya akses struktur organisasi → tampilkan pohon karyawan -->
  <div v-if="auth.can(PERM.ROOT)">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-sm text-mahir-muted">Employee Manajemen Mazta Group</p>
    </div>

    <EmployeeStructureCard />

    <p class="mt-6 text-center text-xs text-slate-400 sm:text-left">
      &copy; Mazta Group. All rights reserved.
    </p>
  </div>

  <!-- Tanpa akses → tema awal "Dashboard Belum Siap" -->
  <div
    v-else
    class="relative min-h-[80vh] w-full rounded-2xl border border-mahir-border bg-white p-6 flex flex-col justify-between"
  >
    <div class="absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full bg-mahir-primary/5 blur-[80px]"></div>

    <div>
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-sm text-mahir-muted">Employee Manajemen Mazta Group</p>
    </div>

    <div class="my-auto py-12 flex flex-col items-center text-center max-w-md mx-auto">
      <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white ring-1 ring-slate-100">
        <ClockIcon class="h-6 w-6 animate-spin" style="animation-duration: 2s;" />
      </div>

      <h2 class="text-xl font-bold text-slate-900 mb-2">Dashboard Belum Siap</h2>
      <p class="text-sm text-slate-500 leading-relaxed">
        Halaman ini masih dalam proses pengembangan dan akan segera hadir (*coming soon*) untuk mempermudah pekerjaan Anda. Terima kasih atas kesabarannya!
      </p>
    </div>

    <div class="border-t border-slate-100 pt-4 text-center sm:text-left text-xs text-slate-400">
      &copy; Mazta Group. All rights reserved.
    </div>
  </div>
</template>
