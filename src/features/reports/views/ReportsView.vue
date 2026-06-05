<script setup>
// Port dari resources/views/pages/reports/index.blade.php + modules/reports.js
import { ref, computed } from "vue";
import { Bar, Line, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Filler,
} from "chart.js";
import { useReports } from "../composables/useReports";
import PageHeader from "@/shared/components/PageHeader.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatCurrency } from "@/shared/utils/format";

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, ArcElement, CategoryScale, LinearScale, Filler);

const { months, monthlyAttendance, monthlyPayroll, deptHeadcount, employeeStats, attendance, payroll, leaveReport } = useReports();

const TABS = [
  { id: "attendance", icon: "bi-calendar2-check", label: "Kehadiran" },
  { id: "payroll", icon: "bi-cash-stack", label: "Penggajian" },
  { id: "employees", icon: "bi-people-fill", label: "Karyawan" },
  { id: "leaves", icon: "bi-file-earmark-text", label: "Cuti & Izin" },
];
const activeTab = ref("attendance");

const COLORS = { primary: "#243B8F", success: "#1B9C67", warning: "#D98E18", danger: "#D14343", info: "#2884E8" };
const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 12 } } } } };

const attTrendData = computed(() => ({
  labels: months.value,
  datasets: [
    { label: "Tepat Waktu", data: monthlyAttendance.value.map((d) => d.ontime), backgroundColor: COLORS.success, borderRadius: 6 },
    { label: "Terlambat", data: monthlyAttendance.value.map((d) => d.late), backgroundColor: COLORS.warning, borderRadius: 6 },
    { label: "Tidak Hadir", data: monthlyAttendance.value.map((d) => d.absent), backgroundColor: COLORS.danger, borderRadius: 6 },
  ],
}));
const stackedOpts = { ...chartOpts, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: "#F1F5F9" } } } };

const payTrendData = computed(() => ({
  labels: months.value,
  datasets: [{
    label: "Total Penggajian", data: monthlyPayroll.value.map((d) => d.total / 1_000_000),
    borderColor: COLORS.primary, backgroundColor: "rgba(36,59,143,0.08)", fill: true, tension: 0.4, pointBackgroundColor: COLORS.primary, pointRadius: 5,
  }],
}));
const lineOpts = { ...chartOpts, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: "#F1F5F9" }, ticks: { callback: (v) => "Rp " + v + " Jt" } } } };

const deptBarData = computed(() => ({
  labels: deptHeadcount.value.map((d) => d.dept),
  datasets: [
    { label: "Aktif", data: deptHeadcount.value.map((d) => d.active), backgroundColor: COLORS.primary, borderRadius: 6 },
    { label: "Nonaktif", data: deptHeadcount.value.map((d) => d.inactive), backgroundColor: "#E2E8F0", borderRadius: 6 },
  ],
}));
const deptBarOpts = { ...chartOpts, indexAxis: "y", scales: { x: { stacked: true, grid: { color: "#F1F5F9" } }, y: { stacked: true, grid: { display: false } } } };

const leavePieData = computed(() => ({
  labels: leaveReport.value.types.map((t) => t.type),
  datasets: [{ data: leaveReport.value.types.map((t) => t.days), backgroundColor: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info, COLORS.danger, "#8B5CF6"], borderWidth: 0 }],
}));
const pieOpts = { responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { position: "right", labels: { boxWidth: 10, font: { size: 12 } } } } };

const sectionTitle = "mb-3 text-sm font-semibold text-slate-800";
const cardCls = "rounded-2xl border border-mahir-border bg-white p-5";
</script>

<template>
  <PageHeader title="Laporan & Analitik" subtitle="Rekap data SDM — periode Nov 2025 – Apr 2026">
    <template #actions>
      <select class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
        <option>Apr 2026</option><option>Mar 2026</option><option>Feb 2026</option><option>Jan 2026</option>
      </select>
      <button class="flex items-center gap-2 rounded-lg border border-mahir-border bg-white px-4 py-2 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50">
        <i class="bi bi-download"></i> Ekspor
      </button>
    </template>
  </PageHeader>

  <!-- Tabs -->
  <div class="mb-4 flex flex-wrap gap-1 border-b border-mahir-border">
    <button
      v-for="t in TABS"
      :key="t.id"
      class="flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2 text-[13.5px] font-medium"
      :class="activeTab === t.id ? 'border-mahir-border bg-white text-mahir-primary' : 'border-transparent bg-transparent text-slate-500 hover:text-slate-700'"
      @click="activeTab = t.id"
    >
      <i class="bi" :class="t.icon"></i> {{ t.label }}
    </button>
  </div>

  <!-- TAB: Kehadiran -->
  <div v-if="activeTab === 'attendance'" :class="cardCls">
    <div class="mb-4 grid grid-cols-2 gap-3 border-b border-slate-100 pb-4 md:grid-cols-4">
      <div class="rounded-xl bg-mahir-success-soft p-3"><div class="text-xl font-bold text-mahir-success">{{ attendance.ontime }}</div><div class="text-xs text-mahir-muted">Tepat Waktu</div></div>
      <div class="rounded-xl bg-mahir-warning-soft p-3"><div class="text-xl font-bold text-mahir-warning">{{ attendance.late }}</div><div class="text-xs text-mahir-muted">Terlambat</div></div>
      <div class="rounded-xl bg-mahir-danger-soft p-3"><div class="text-xl font-bold text-mahir-danger">{{ attendance.absent }}</div><div class="text-xs text-mahir-muted">Tidak Hadir</div></div>
      <div class="rounded-xl bg-mahir-primary-soft p-3"><div class="text-xl font-bold text-mahir-primary">{{ attendance.rate }}%</div><div class="text-xs text-mahir-muted">Tingkat Kehadiran</div></div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div :class="sectionTitle">Tren Kehadiran 6 Bulan Terakhir</div>
        <div class="h-64"><Bar :data="attTrendData" :options="stackedOpts" /></div>
      </div>
      <div>
        <div :class="sectionTitle">Rekap per Departemen</div>
        <table class="w-full text-left text-[12.5px]">
          <thead><tr class="border-b border-mahir-border text-slate-400"><th class="py-2">Dept</th><th class="py-2">Aktif</th><th class="py-2">OT</th><th class="py-2">Telat</th><th class="py-2">Absen</th><th class="py-2">Rate</th></tr></thead>
          <tbody>
            <tr v-for="d in attendance.deptRows" :key="d.dept" class="border-b border-mahir-border last:border-0">
              <td class="py-2 text-slate-700">{{ d.dept }}</td><td class="py-2">{{ d.active }}</td><td class="py-2">{{ d.ot }}</td><td class="py-2">{{ d.late }}</td><td class="py-2">{{ d.absent }}</td>
              <td class="py-2"><StatusBadge :status="d.rate >= 90 ? 'approved' : d.rate >= 80 ? 'pending' : 'rejected'" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- TAB: Penggajian -->
  <div v-else-if="activeTab === 'payroll'" :class="cardCls">
    <div class="mb-4 grid grid-cols-2 gap-3 border-b border-slate-100 pb-4 md:grid-cols-4">
      <div class="rounded-xl bg-mahir-primary-soft p-3"><div class="text-[15px] font-bold text-mahir-primary">{{ formatCurrency(payroll.total) }}</div><div class="text-xs text-mahir-muted">Total Penggajian Apr</div></div>
      <div class="rounded-xl bg-mahir-success-soft p-3"><div class="text-[15px] font-bold text-mahir-success">{{ formatCurrency(payroll.basic) }}</div><div class="text-xs text-mahir-muted">Gaji Pokok</div></div>
      <div class="rounded-xl bg-mahir-info-soft p-3"><div class="text-[15px] font-bold text-mahir-info">{{ formatCurrency(payroll.allowance) }}</div><div class="text-xs text-mahir-muted">Total Tunjangan</div></div>
      <div class="rounded-xl bg-mahir-danger-soft p-3"><div class="text-[15px] font-bold text-mahir-danger">{{ formatCurrency(payroll.deduction) }}</div><div class="text-xs text-mahir-muted">Total Potongan</div></div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <div :class="sectionTitle">Tren Penggajian 6 Bulan Terakhir</div>
        <div class="h-64"><Line :data="payTrendData" :options="lineOpts" /></div>
      </div>
      <div class="lg:col-span-5">
        <div :class="sectionTitle">Biaya Gaji per Departemen</div>
        <table class="w-full text-left text-[12.5px]">
          <thead><tr class="border-b border-mahir-border text-slate-400"><th class="py-2">Departemen</th><th class="py-2 text-center">Karyawan</th><th class="py-2">Total Gaji</th><th class="py-2">Rata-rata</th></tr></thead>
          <tbody>
            <tr v-for="d in payroll.deptRows" :key="d.dept" class="border-b border-mahir-border last:border-0">
              <td class="py-2 text-slate-700">{{ d.dept }}</td><td class="py-2 text-center">{{ d.count }}</td><td class="py-2">{{ formatCurrency(d.total) }}</td><td class="py-2">{{ formatCurrency(d.avg) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- TAB: Karyawan -->
  <div v-else-if="activeTab === 'employees'" :class="cardCls">
    <div class="mb-4 grid grid-cols-2 gap-3 border-b border-slate-100 pb-4 md:grid-cols-4">
      <div class="rounded-xl bg-mahir-primary-soft p-3"><div class="text-xl font-bold text-mahir-primary">{{ employeeStats?.total ?? '—' }}</div><div class="text-xs text-mahir-muted">Total Karyawan</div></div>
      <div class="rounded-xl bg-mahir-success-soft p-3"><div class="text-xl font-bold text-mahir-success">{{ employeeStats?.active ?? '—' }}</div><div class="text-xs text-mahir-muted">Aktif</div></div>
      <div class="rounded-xl bg-mahir-danger-soft p-3"><div class="text-xl font-bold text-mahir-danger">{{ employeeStats?.inactive ?? '—' }}</div><div class="text-xs text-mahir-muted">Nonaktif</div></div>
      <div class="rounded-xl bg-mahir-info-soft p-3"><div class="text-xl font-bold text-mahir-info">{{ deptHeadcount.length }}</div><div class="text-xs text-mahir-muted">Departemen</div></div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div :class="sectionTitle">Jumlah Karyawan per Departemen</div>
        <div class="h-72"><Bar :data="deptBarData" :options="deptBarOpts" /></div>
      </div>
      <div>
        <div :class="sectionTitle">Headcount Departemen</div>
        <table class="w-full text-left text-[12.5px]">
          <thead><tr class="border-b border-mahir-border text-slate-400"><th class="py-2">Dept</th><th class="py-2 text-center">Total</th><th class="py-2 text-center">Aktif</th><th class="py-2 text-center">Nonaktif</th></tr></thead>
          <tbody>
            <tr v-for="d in deptHeadcount" :key="d.dept" class="border-b border-mahir-border last:border-0">
              <td class="py-2 text-slate-700">{{ d.dept }}</td><td class="py-2 text-center">{{ d.total }}</td><td class="py-2 text-center text-mahir-success">{{ d.active }}</td><td class="py-2 text-center text-mahir-danger">{{ d.inactive }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- TAB: Cuti & Izin -->
  <div v-else :class="cardCls">
    <div class="mb-4 grid grid-cols-2 gap-3 border-b border-slate-100 pb-4 md:grid-cols-4">
      <div class="rounded-xl bg-mahir-primary-soft p-3"><div class="text-xl font-bold text-mahir-primary">{{ leaveReport.total }}</div><div class="text-xs text-mahir-muted">Total Pengajuan</div></div>
      <div class="rounded-xl bg-mahir-success-soft p-3"><div class="text-xl font-bold text-mahir-success">{{ leaveReport.approved }}</div><div class="text-xs text-mahir-muted">Disetujui</div></div>
      <div class="rounded-xl bg-mahir-warning-soft p-3"><div class="text-xl font-bold text-mahir-warning">{{ leaveReport.pending }}</div><div class="text-xs text-mahir-muted">Menunggu</div></div>
      <div class="rounded-xl bg-mahir-info-soft p-3"><div class="text-xl font-bold text-mahir-info">{{ leaveReport.totalDays }} hari</div><div class="text-xs text-mahir-muted">Total Hari Cuti</div></div>
    </div>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <div :class="sectionTitle">Distribusi Jenis Cuti (Hari)</div>
        <div class="h-64"><Doughnut :data="leavePieData" :options="pieOpts" /></div>
      </div>
      <div class="lg:col-span-7">
        <div :class="sectionTitle">Breakdown per Jenis Cuti</div>
        <table class="w-full text-left text-[13px]">
          <thead><tr class="border-b border-mahir-border text-slate-400"><th class="py-2">Jenis Cuti</th><th class="py-2 text-center">Total Hari</th><th class="py-2 text-center">Persentase</th></tr></thead>
          <tbody>
            <tr v-for="t in leaveReport.types" :key="t.type" class="border-b border-mahir-border last:border-0">
              <td class="py-2 text-slate-700">{{ t.type }}</td><td class="py-2 text-center">{{ t.days }}</td><td class="py-2 text-center">{{ t.pct }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
