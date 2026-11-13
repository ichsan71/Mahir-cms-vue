// Pilihan jumlah baris per halaman untuk daftar paginated.
export const PAGE_SIZES = [10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

// Peta status → { label, cls }. Case-insensitive, jatuh ke label mentah bila
// tak dikenal. Dua sumber status melewati sini:
// - Payslip.status (enum PAYSLIP_STATUS via employeeChoices): DRAFT/PENDING/FINAL
// - PayslipApproval.status (LeaveApprovalStatusChoices): WAITING/PENDING/APPROVED/REJECTED
const SUCCESS = "bg-mahir-success-soft text-mahir-success";
const WARNING = "bg-mahir-warning-soft text-mahir-warning";
const DANGER = "bg-mahir-danger-soft text-mahir-danger";
const INFO = "bg-mahir-info-soft text-mahir-info";
const MUTED = "bg-slate-100 text-slate-500";

const STATUS_MAP = {
  // Payslip
  draft: { label: "Draf", cls: MUTED },
  pending: { label: "Menunggu", cls: WARNING },
  final: { label: "Final", cls: INFO },
  // Baris persetujuan (PayslipApproval)
  waiting: { label: "Menunggu", cls: WARNING },
  approved: { label: "Disetujui", cls: SUCCESS },
  rejected: { label: "Ditolak", cls: DANGER },
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

// Bangun langkah stepper persetujuan: urut berdasarkan `order`, lalu tandai state
// tiap langkah — "done" (approved), "rejected", "current" (langkah pending
// pertama = sedang ditunggu), "upcoming" (pending berikutnya). Jika ada yang
// ditolak, tidak ada langkah "current" (alur berhenti).
export function buildApprovalSteps(approvals) {
  const list = [...(approvals || [])].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  const hasRejected = list.some((a) => String(a.status || "").toLowerCase() === "rejected");
  let currentSet = false;
  return list.map((a) => {
    const s = String(a.status || "").toLowerCase();
    let state;
    if (s === "approved") state = "done";
    else if (s === "rejected") state = "rejected";
    else if (!hasRejected && !currentSet) {
      state = "current";
      currentSet = true;
    } else state = "upcoming";
    return { ...a, state };
  });
}

// Nama approver yang sedang ditunggu (null bila tak ada langkah "current").
export function currentApproverName(approvals) {
  const step = buildApprovalSteps(approvals).find((s) => s.state === "current");
  return step?.approver?.fullName ?? null;
}

// Catatan: filter status di tab Persetujuan memfilter status BARIS approval
// (LeaveApprovalStatusChoices: WAITING/PENDING/APPROVED/REJECTED) — sesuai tipe
// param `status` di schema. Opsi diambil via useEnumChoices("LEAVE_APPROVAL_STATUS")
// di PayslipApprovalsView.vue. Default filter = PENDING (butuh persetujuan).
