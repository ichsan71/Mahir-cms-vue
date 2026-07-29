<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: String, required: true },
});

// Peta status → label & kelas warna (soft background).
// Mencakup seluruh kosakata status: karyawan, cuti, payroll, kehadiran, rekrutmen.
const SUCCESS = "bg-mahir-success-soft text-mahir-success";
const WARNING = "bg-mahir-warning-soft text-mahir-warning";
const DANGER = "bg-mahir-danger-soft text-mahir-danger";
const INFO = "bg-mahir-info-soft text-mahir-info";
const MUTED = "bg-slate-100 text-slate-500";

const MAP = {
  // Karyawan
  active: { label: "Aktif", cls: SUCCESS },
  inactive: { label: "Non-Aktif", cls: MUTED },
  // Cuti & approval
  pending: { label: "Menunggu", cls: WARNING },
  approved: { label: "Disetujui", cls: SUCCESS },
  rejected: { label: "Ditolak", cls: DANGER },
  cancelled: { label: "Dibatalkan", cls: MUTED },
  canceled: { label: "Dibatalkan", cls: MUTED },
  // Pengumuman
  draft: { label: "Draf", cls: MUTED },
  published: { label: "Terbit", cls: SUCCESS },
  scheduled: { label: "Terjadwal", cls: INFO },
  archived: { label: "Arsip", cls: MUTED },
  expired: { label: "Kedaluwarsa", cls: DANGER },
  // Payroll
  paid: { label: "Lunas", cls: SUCCESS },
  unpaid: { label: "Belum Bayar", cls: DANGER },
  // Kehadiran
  ontime: { label: "Tepat Waktu", cls: SUCCESS },
  late: { label: "Terlambat", cls: WARNING },
  absent: { label: "Tidak Hadir", cls: DANGER },
  leave: { label: "Cuti/Izin", cls: INFO },
  // Rekrutmen — lowongan
  open: { label: "Terbuka", cls: SUCCESS },
  closed: { label: "Ditutup", cls: MUTED },
  // Rekrutmen — tahap pelamar
  screening: { label: "Screening", cls: WARNING },
  interview: { label: "Interview", cls: INFO },
  offer: { label: "Penawaran", cls: "bg-mahir-primary-soft text-mahir-primary" },
  hired: { label: "Diterima", cls: SUCCESS },
};

const meta = computed(() => MAP[props.status] || { label: props.status, cls: MUTED });
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="meta.cls"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
    {{ meta.label }}
  </span>
</template>
