<script setup>
// Dashboard: kartu ringkasan kehadiran (real via subscription/query) + pengumuman.
// Kartu statistik/chart/aktivitas lama memakai query mock yang tidak ada di
// backend nyata (dashboardStats, attendanceWeekly, dst.) — sudah dilepas agar
// tidak memicu error GraphQL saat login.
import AttendanceSummaryCard from "../components/AttendanceSummaryCard.vue";
import AnnouncementDashboardCard from "@/features/announcements/components/AnnouncementDashboardCard.vue";
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-sm text-mahir-muted">Employee Manajemen Mazta Group</p>
    </div>

    <!-- Kartu kehadiran mengatur tata letak: KPI + daftar telat/cuti di kiri,
         pengumuman (slot) di kanan, lalu grafik full-width di bawah. Keduanya
         tetap self-gating izinnya masing-masing. -->
    <AttendanceSummaryCard>
      <AnnouncementDashboardCard />
    </AttendanceSummaryCard>

    <p class="mt-6 text-center text-xs text-slate-400 sm:text-left">
      &copy; Mazta Group. All rights reserved.
    </p>
  </div>
</template>
