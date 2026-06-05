<script setup>
// Port dari resources/views/pages/dashboard.blade.php
import { useDashboard } from "../composables/useDashboard";
import StatsCard from "@/shared/components/StatsCard.vue";
import AttendanceChart from "../components/AttendanceChart.vue";
import DeptDistributionChart from "../components/DeptDistributionChart.vue";
import ActivityFeed from "../components/ActivityFeed.vue";
import PendingLeavesTable from "../components/PendingLeavesTable.vue";

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
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
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
        <i class="bi bi-download"></i> Ekspor
      </button>
      <button
        class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
      >
        <i class="bi bi-plus-lg"></i> Tambah Karyawan
      </button>
    </div>
  </div>

  <!-- Stats row -->
  <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatsCard
      :value="stats?.totalEmployees ?? '—'"
      label="Total Karyawan"
      icon="bi-people-fill"
      color="#243B8F"
      bg-color="#E7EEFF"
      :delta="stats?.employeesDelta"
      delta-dir="up"
    />
    <StatsCard
      :value="stats?.presentToday ?? '—'"
      label="Hadir Hari Ini"
      icon="bi-calendar2-check"
      color="#1B9C67"
      bg-color="#E2F8EC"
      :delta="stats ? `dari ${stats.totalHeadcount} karyawan` : null"
      delta-dir="up"
    />
    <StatsCard
      :value="stats?.pendingLeaves ?? '—'"
      label="Cuti Menunggu"
      icon="bi-file-earmark-text"
      color="#D98E18"
      bg-color="#FFF3DA"
    />
    <StatsCard
      :value="stats?.pendingPayroll ?? '—'"
      label="Payroll Pending"
      icon="bi-cash-stack"
      color="#D14343"
      bg-color="#FCE7E7"
    />
  </div>

  <!-- Charts row -->
  <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="rounded-2xl border border-mahir-border bg-white p-5 lg:col-span-2">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Kehadiran Minggu Ini</h2>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">21 – 25 Apr 2026</span>
          <button
            class="rounded-lg border border-mahir-border bg-white px-2.5 py-1 text-xs text-slate-600"
          >
            Minggu ini <i class="bi bi-chevron-down ml-1"></i>
          </button>
        </div>
      </div>
      <AttendanceChart :data="attendanceWeekly" />
    </div>

    <div class="rounded-2xl border border-mahir-border bg-white p-5">
      <h2 class="mb-4 font-semibold text-slate-900">Distribusi Departemen</h2>
      <DeptDistributionChart :data="deptDistribution" />
    </div>
  </div>

  <!-- Bottom row -->
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
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
  </div>
</template>
