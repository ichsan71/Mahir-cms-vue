// Sumber tunggal untuk ringkasan kehadiran (kartu atas) — dipakai tab Kalender
// maupun tab Daftar agar tampilannya identik.
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";

// Pemetaan string `status` backend → salah satu dari 4 kategori kartu.
// `status` di Attendance adalah String bebas (bukan enum) → cocokkan
// case-insensitive. Status di luar ini (PENDING/WEEKEND/EARLY_LEAVE) tak dihitung.
export const STATUS_MAP = {
  present: "hadir",
  hadir: "hadir",
  ontime: "hadir",
  late: "terlambat",
  terlambat: "terlambat",
  absent: "tidakHadir",
  alpha: "tidakHadir",
  alpa: "tidakHadir",
  on_leave: "cuti",
  leave: "cuti",
  cuti: "cuti",
  izin: "cuti",
};

// Hitung jumlah per kategori dari daftar record kehadiran.
export function summarizeAttendance(records = []) {
  const acc = { hadir: 0, terlambat: 0, tidakHadir: 0, cuti: 0 };
  for (const r of records) {
    const bucket = STATUS_MAP[String(r?.status ?? "").trim().toLowerCase()];
    if (bucket) acc[bucket] += 1;
  }
  return acc;
}

// Definisi kartu (urutan, label, ikon, warna) — dipakai kedua tab.
export const ATTENDANCE_SUMMARY_CARDS = [
  { key: "hadir", label: "Hadir", icon: CheckCircleIcon, cls: "bg-mahir-success-soft text-mahir-success" },
  { key: "terlambat", label: "Terlambat", icon: ClockIcon, cls: "bg-mahir-warning-soft text-mahir-warning" },
  { key: "tidakHadir", label: "Tidak Hadir", icon: XCircleIcon, cls: "bg-mahir-danger-soft text-mahir-danger" },
  { key: "cuti", label: "Cuti", icon: CalendarDaysIcon, cls: "bg-mahir-info-soft text-mahir-info" },
];
