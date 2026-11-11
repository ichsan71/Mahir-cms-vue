// Pilihan jumlah baris per halaman untuk daftar paginated.
export const PAGE_SIZES = [10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Status slip gaji & persetujuan datang sebagai String bebas dari backend
// (tak ada enum di skema). Peta ini defensif: case-insensitive, dan jatuh ke
// label mentah bila status tak dikenal.
const SUCCESS = "bg-mahir-success-soft text-mahir-success";
const WARNING = "bg-mahir-warning-soft text-mahir-warning";
const DANGER = "bg-mahir-danger-soft text-mahir-danger";
const INFO = "bg-mahir-info-soft text-mahir-info";
const MUTED = "bg-slate-100 text-slate-500";

const STATUS_MAP = {
  draft: { label: "Draf", cls: MUTED },
  finalized: { label: "Final", cls: INFO },
  final: { label: "Final", cls: INFO },
  waiting: { label: "Menunggu", cls: WARNING },
  pending: { label: "Menunggu", cls: WARNING },
  submitted: { label: "Diajukan", cls: WARNING },
  approved: { label: "Disetujui", cls: SUCCESS },
  rejected: { label: "Ditolak", cls: DANGER },
  cancelled: { label: "Dibatalkan", cls: MUTED },
  canceled: { label: "Dibatalkan", cls: MUTED },
  emitted: { label: "Terbit", cls: SUCCESS },
  paid: { label: "Dibayar", cls: SUCCESS },
};

// Kembalikan { label, cls } untuk sebuah status (payslip maupun approval).
export function statusMeta(status) {
  if (!status) return { label: "-", cls: MUTED };
  return STATUS_MAP[String(status).toLowerCase()] || { label: status, cls: MUTED };
}

// Apakah sebuah slip masih bisa diubah/diajukan (belum final/terkirim approval).
export function isDraft(status) {
  return String(status || "").toLowerCase() === "draft";
}

// Apakah slip siap diajukan untuk persetujuan.
// Alur baru: slip hasil generate berstatus "draft" dan langsung bisa diajukan.
// Status "final" (hasil approve) bersifat terminal, tombol "Ajukan" tak muncul.
export function isSubmittable(status) {
  return String(status || "").toLowerCase() === "draft";
}

// Apakah baris persetujuan masih menunggu aksi approver.
export function isPendingApproval(status) {
  const s = String(status || "").toLowerCase();
  return s === "waiting" || s === "pending" || s === "submitted";
}

// Opsi status untuk filter persetujuan (selaras LeaveApprovalStatusChoices).
// Catatan: backend memakai enum WAITING/PENDING/APPROVED/REJECTED; "Menunggu"
// difilter ke WAITING (status antre approver pada alur cuti). Bila backend slip
// memakai PENDING, pilih "Semua" untuk melihat seluruh baris.
export const APPROVAL_STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "WAITING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];
