<script setup>
// Halaman "Izin di Jam Kerja" — 2 tab:
//  • Pengajuan   : izin milik akun login (self); Ajukan + Batalkan.
//  • Persetujuan : tugas persetujuan (listLeaveAtWorkHourApproval by approverId);
//                  Setujui/Tolak memakai id BARIS approval (bukan id izin).
import { ref, computed } from "vue";
import { useLeaveAtWorkHours } from "../composables/useLeaveAtWorkHours";
import { useLeaveAtWorkHourApprovals } from "../composables/useLeaveAtWorkHourApprovals";
import { useLeaveAtWorkHourForm } from "../composables/useLeaveAtWorkHourForm";
import LeaveAtWorkHourFormModal from "../components/LeaveAtWorkHourFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import {
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";

const auth = useAuthStore();

// Tab "Pengajuan" (izin sendiri).
const {
  items: myItems,
  pagination: myPagination,
  loading: myLoading,
  refetch: refetchMine,
  status: myStatus,
  nextPage: myNextPage,
  prevPage: myPrevPage,
} = useLeaveAtWorkHours("self");

// Tab "Persetujuan" (tugas approval untuk akun login).
const {
  items: apprItems,
  pagination: apprPagination,
  loading: apprLoading,
  refetch: refetchApprovals,
  pendingCount,
  refetchCount,
  status: apprStatus,
  nextPage: apprNextPage,
  prevPage: apprPrevPage,
} = useLeaveAtWorkHourApprovals();

const { createLeave, editLeave, submit, approve, reject, remove, loading: saving } = useLeaveAtWorkHourForm();

const canCreate = computed(() => auth.can(PERM.CREATE));
const canEdit = computed(() => auth.can(PERM.EDIT));
const canSubmit = computed(() => auth.can(PERM.SUBMIT));
const canDelete = computed(() => auth.can(PERM.DELETE));
const canApprove = computed(() => auth.can(PERM.APPROVE));
const canReject = computed(() => auth.can(PERM.REJECT));
const canViewApprovals = computed(() => auth.can(PERM.APPROVAL_LIST));

const tabs = computed(() => [
  { id: "pengajuan", label: "Pengajuan" },
  ...(canViewApprovals.value ? [{ id: "persetujuan", label: "Persetujuan" }] : []),
]);
const tab = ref("pengajuan");

// ── Progres persetujuan (sama seperti list pengajuan cuti) ───────────────────
function isApproved(s) {
  return String(s ?? "").toUpperCase() === "APPROVED";
}
function isRejected(s) {
  return String(s ?? "").toUpperCase() === "REJECTED";
}
function isPending(s) {
  return !isApproved(s) && !isRejected(s);
}
function approvedCount(row) {
  return (row?.approvals ?? []).filter((a) => isApproved(a.status)).length;
}
function pendingApprovers(row) {
  return (row?.approvals ?? []).filter((a) => isPending(a.status));
}
// Nama approver diambil dari approver.mandatoryApprovals[].employee.fullName;
// fallback ke approver.fullName bila mandatoryApprovals kosong.
function approverName(a) {
  const names = (a?.approver?.mandatoryApprovals ?? [])
    .map((m) => m?.employee?.fullName)
    .filter(Boolean);
  if (names.length) return names.join(", ");
  return a?.approver?.fullName || "—";
}
function pendingNames(row) {
  return pendingApprovers(row)
    .map((a) => approverName(a))
    .join(", ");
}
// Warna nama & ikon approver mengikuti status (pending = kuning).
function approverNameClass(s) {
  if (isApproved(s)) return "text-mahir-success";
  if (isRejected(s)) return "text-mahir-danger";
  return "text-mahir-warning";
}

// Status (string) → key lowercase utk StatusBadge.
function badgeKey(s) {
  return String(s ?? "").toLowerCase();
}
// Aksen warna kiri kartu persetujuan berdasarkan status approval.
function accent(s) {
  if (isApproved(s)) return "bg-mahir-success";
  if (isRejected(s)) return "bg-mahir-danger";
  if (String(s ?? "").toUpperCase() === "PENDING") return "bg-mahir-warning";
  return "bg-slate-300";
}
// Jam izin "HH:mm:ss" → "HH:mm".
function fmtTime(t) {
  return t ? String(t).slice(0, 5) : null;
}

const STATUS_FILTERS = [
  { value: "", label: "Semua status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// ── Ajukan / Ubah ──────────────────────────────────────────────────────────
const modalOpen = ref(false);
const editingRow = ref(null); // baris DRAFT yang sedang diubah; null = mode tambah

function openCreate() {
  editingRow.value = null;
  modalOpen.value = true;
}
function openEdit(row) {
  editingRow.value = row;
  modalOpen.value = true;
}

async function handleSave({ input, id }) {
  const res = id ? await editLeave(id, input) : await createLeave(input);
  if (res) {
    modalOpen.value = false;
    editingRow.value = null;
    refetchMine();
  }
}

// ── Setujui / Tolak / Batalkan ───────────────────────────────────────────────
const confirmOpen = ref(false);
const action = ref(null); // 'approve' | 'reject' | 'delete'
const target = ref(null); // baris izin (delete) atau baris approval (approve/reject)

const confirmMeta = computed(() => {
  // approve/reject: target = baris approval (punya .leaveAtWorkHour).
  // delete/submit: target = baris izin itu sendiri.
  const izin = ["delete", "submit"].includes(action.value) ? target.value : target.value?.leaveAtWorkHour;
  const name = izin?.leaveType?.name ?? "izin";
  const date = formatDate(izin?.date);
  switch (action.value) {
    case "approve":
      return { title: "Setujui Izin", message: `Setujui ${name} tanggal ${date}?`, text: "Ya, Setujui" };
    case "reject":
      return { title: "Tolak Izin", message: `Tolak ${name} tanggal ${date}?`, text: "Ya, Tolak" };
    case "submit":
      return { title: "Kirim Izin", message: `Kirim ${name} tanggal ${date} untuk persetujuan? Setelah dikirim, izin tidak bisa diubah lagi.`, text: "Ya, Kirim" };
    case "delete":
      return { title: "Batalkan Izin", message: `Batalkan pengajuan ${name} tanggal ${date}? Tindakan ini tidak dapat dibatalkan.`, text: "Ya, Batalkan" };
    default:
      return { title: "", message: "", text: "Ya" };
  }
});

function openAction(type, row) {
  action.value = type;
  target.value = row;
  confirmOpen.value = true;
}

async function handleConfirm() {
  if (!target.value) return;
  let ok = false;
  // approve/reject: id = id BARIS approval; delete: id = id izin.
  if (action.value === "approve") ok = await approve(target.value.id);
  else if (action.value === "reject") ok = await reject(target.value.id);
  else if (action.value === "submit") ok = await submit(target.value.id);
  else if (action.value === "delete") ok = await remove(target.value.id);
  if (ok) {
    confirmOpen.value = false;
    target.value = null;
    action.value = null;
    refetchMine();
    refetchApprovals();
    refetchCount();
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header + tab -->
    <div class="flex flex-wrap items-center justify-between gap-3 px-5 pt-3">
      <div class="flex gap-1">
        <button
          v-for="t in tabs"
          :key="t.id"
          class="-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors"
          :class="tab === t.id ? 'border-mahir-primary text-mahir-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
          @click="tab = t.id"
        >
          {{ t.label }}
          <span
            v-if="t.id === 'persetujuan' && pendingCount > 0"
            class="inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10.5px] font-bold leading-none text-white"
            :title="`${pendingCount} izin menunggu persetujuan`"
          >{{ pendingCount > 99 ? "99+" : pendingCount }}</span>
        </button>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
        @click="openCreate"
      >
        <PlusIcon class="h-4 w-4" /> Ajukan
      </button>
    </div>
    <div class="border-b border-mahir-border"></div>

    <!-- ══════════ TAB PENGAJUAN ══════════ -->
    <template v-if="tab === 'pengajuan'">
      <div class="flex items-center justify-between px-5 py-3">
        <span class="text-sm text-slate-500">{{ myPagination.count }} pengajuan</span>
        <select
          v-model="myStatus"
          class="rounded-lg border border-mahir-border px-3 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
        >
          <option v-for="f in STATUS_FILTERS" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </div>

      <div class="px-5 pb-4">
        <div v-if="myLoading && !myItems.length" class="py-10 text-center text-slate-400">
          <ArrowPathIcon class="mx-auto h-5 w-5 animate-spin" />
        </div>
        <div v-else-if="!myItems.length" class="py-10 text-center text-sm text-slate-400">
          Belum ada pengajuan izin.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="row in myItems"
            :key="row.id"
            class="flex items-stretch gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
          >
            <!-- Aksen status -->
            <span class="w-1 flex-shrink-0 rounded-full" :class="accent(row.status)"></span>

            <!-- Ikon -->
            <span class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
              <CalendarDaysIcon class="h-5 w-5" />
            </span>

            <!-- Info utama -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[14px] font-semibold text-slate-800">{{ row.leaveType?.name || "—" }}</span>
              </div>
              <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-slate-500">
                <span class="inline-flex items-center gap-1">
                  <CalendarDaysIcon class="h-3.5 w-3.5 text-slate-400" />
                  {{ formatDate(row.date) }}
                </span>
                <template v-if="fmtTime(row.expectedCheckOut) || fmtTime(row.expectedCheckIn)">
                  <span class="text-slate-300">·</span>
                  <span class="inline-flex items-center gap-1.5">
                    <ClockIcon class="h-3.5 w-3.5 text-slate-400" />
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[11px] text-slate-400">Keluar</span>
                      <span class="font-medium text-slate-600">{{ fmtTime(row.expectedCheckOut) || "—" }}</span>
                    </span>
                    <span class="text-slate-300">→</span>
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[11px] text-slate-400">Kembali</span>
                      <span class="font-medium text-slate-600">{{ fmtTime(row.expectedCheckIn) || "—" }}</span>
                    </span>
                  </span>
                </template>
              </div>
              <p v-if="row.reason" class="mt-0.5 line-clamp-1 text-[12.5px] text-slate-400">{{ row.reason }}</p>

              <!-- Progres persetujuan (sama seperti list pengajuan cuti) -->
              <div v-if="row.approvals?.length" class="mt-1.5 space-y-1">
                <div
                  v-if="pendingApprovers(row).length"
                  class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-mahir-warning"
                >
                  <ClockIcon class="h-3.5 w-3.5" />
                  Menunggu: {{ pendingNames(row) }}
                </div>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-[13px] font-semibold text-mahir-muted">
                    Persetujuan {{ approvedCount(row) }}/{{ row.approvals.length }}
                  </span>
                  <span
                    v-for="a in row.approvals"
                    :key="a.id"
                    class="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[12.5px]"
                    :title="approverName(a)"
                  >
                    <UserCircleIcon class="h-4 w-4 flex-shrink-0" :class="approverNameClass(a.status)" />
                    <span class="font-medium leading-none" :class="approverNameClass(a.status)">{{ approverName(a) }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Kanan: status + lampiran + aksi -->
            <div class="flex flex-shrink-0 flex-col items-end gap-2">
              <StatusBadge :status="badgeKey(row.status)" />
              <a
                v-if="row.attachment"
                :href="row.attachment"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-[12px] text-mahir-primary hover:underline"
              >
                <PaperClipIcon class="h-3.5 w-3.5" /> Lampiran
              </a>
              <!-- DRAFT: bisa Ubah, Batalkan, Kirim. Setelah dikirim (PENDING) hanya Batalkan. -->
              <div
                v-if="(canEdit && row.status === 'DRAFT') || (canDelete && ['DRAFT', 'PENDING'].includes(row.status)) || (canSubmit && row.status === 'DRAFT')"
                class="flex items-center gap-1.5"
              >
                <button
                  v-if="canEdit && row.status === 'DRAFT'"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                  title="Ubah"
                  @click="openEdit(row)"
                >
                  <PencilSquareIcon class="h-3.5 w-3.5" /> Ubah
                </button>
                <button
                  v-if="canDelete && ['DRAFT', 'PENDING'].includes(row.status)"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                  title="Batalkan pengajuan"
                  @click="openAction('delete', row)"
                >
                  <XMarkIcon class="h-3.5 w-3.5" /> Batal
                </button>
                <button
                  v-if="canSubmit && row.status === 'DRAFT'"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-mahir-primary px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-mahir-primary/90"
                  title="Kirim untuk persetujuan"
                  @click="openAction('submit', row)"
                >
                  <PaperAirplaneIcon class="h-3.5 w-3.5" /> Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
        <span class="text-[13px] text-mahir-muted">Menampilkan {{ myItems.length }} dari {{ myPagination.count }} izin</span>
        <nav class="flex items-center gap-1">
          <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!myPagination.hasPrev" @click="myPrevPage">‹</button>
          <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">{{ myPagination.currentPage }}</span>
          <span class="px-1 text-[13px] text-mahir-muted">dari {{ myPagination.totalPages }}</span>
          <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!myPagination.hasNext" @click="myNextPage">›</button>
        </nav>
      </div>
    </template>

    <!-- ══════════ TAB PERSETUJUAN ══════════ -->
    <template v-else-if="tab === 'persetujuan'">
      <div class="flex items-center justify-between px-5 py-3">
        <span class="text-sm text-slate-500">{{ apprPagination.count }} tugas persetujuan</span>
        <select
          v-model="apprStatus"
          class="rounded-lg border border-mahir-border px-3 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
        >
          <option v-for="f in STATUS_FILTERS" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </div>

      <div class="px-5 pb-4">
        <div v-if="apprLoading && !apprItems.length" class="py-10 text-center text-slate-400">
          <ArrowPathIcon class="mx-auto h-5 w-5 animate-spin" />
        </div>
        <div v-else-if="!apprItems.length" class="py-10 text-center text-sm text-slate-400">
          Tidak ada tugas persetujuan.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="row in apprItems"
            :key="row.id"
            class="group flex items-stretch gap-3.5 overflow-hidden rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
          >
            <!-- Aksen status -->
            <span class="w-1 flex-shrink-0 rounded-full" :class="accent(row.status)"></span>

            <!-- Ikon -->
            <span class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
              <CalendarDaysIcon class="h-5 w-5" />
            </span>

            <!-- Info utama -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[14px] font-semibold text-slate-800">
                  {{ row.leaveAtWorkHour?.employee?.fullName || "—" }}
                </span>
                <span
                  v-if="row.leaveAtWorkHour?.leaveType?.name"
                  class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
                >
                  {{ row.leaveAtWorkHour.leaveType.name }}
                </span>
                <StatusBadge v-if="row.leaveAtWorkHour?.status" :status="badgeKey(row.leaveAtWorkHour.status)" />
              </div>
              <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-slate-500">
                <span class="inline-flex items-center gap-1">
                  <CalendarDaysIcon class="h-3.5 w-3.5 text-slate-400" />
                  {{ formatDate(row.leaveAtWorkHour?.date) }}
                </span>
                <template v-if="fmtTime(row.leaveAtWorkHour?.expectedCheckOut) || fmtTime(row.leaveAtWorkHour?.expectedCheckIn)">
                  <span class="text-slate-300">·</span>
                  <span class="inline-flex items-center gap-1.5">
                    <ClockIcon class="h-3.5 w-3.5 text-slate-400" />
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[11px] text-slate-400">Keluar</span>
                      <span class="font-medium text-slate-600">{{ fmtTime(row.leaveAtWorkHour?.expectedCheckOut) || "—" }}</span>
                    </span>
                    <span class="text-slate-300">→</span>
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[11px] text-slate-400">Kembali</span>
                      <span class="font-medium text-slate-600">{{ fmtTime(row.leaveAtWorkHour?.expectedCheckIn) || "—" }}</span>
                    </span>
                  </span>
                </template>
              </div>
              <p v-if="row.leaveAtWorkHour?.reason" class="mt-0.5 line-clamp-1 text-[12.5px] text-slate-400">
                {{ row.leaveAtWorkHour.reason }}
              </p>
              <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-mahir-muted">
                <span class="inline-flex items-center gap-1">
                  <UserCircleIcon class="h-3.5 w-3.5" />
                  Approver: {{ approverName(row) }}
                </span>
                <a
                  v-if="row.leaveAtWorkHour?.attachment"
                  :href="row.leaveAtWorkHour.attachment"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-mahir-primary hover:underline"
                >
                  <PaperClipIcon class="h-3.5 w-3.5" /> Lampiran
                </a>
              </div>
            </div>

            <!-- Status + aksi -->
            <div class="flex flex-shrink-0 flex-col items-end gap-2">
              <StatusBadge :status="badgeKey(row.status)" />
              <div
                v-if="row.status === 'PENDING' && (canApprove || canReject)"
                class="flex items-center gap-1.5"
              >
                <button
                  v-if="canReject"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-mahir-danger/30 px-2.5 py-1 text-[12px] font-semibold text-mahir-danger hover:bg-mahir-danger-soft"
                  title="Tolak"
                  @click="openAction('reject', row)"
                >
                  <XMarkIcon class="h-3.5 w-3.5" /> Tolak
                </button>
                <button
                  v-if="canApprove"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-mahir-success px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-mahir-success/90"
                  title="Setujui"
                  @click="openAction('approve', row)"
                >
                  <CheckIcon class="h-3.5 w-3.5" /> Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
        <span class="text-[13px] text-mahir-muted">Menampilkan {{ apprItems.length }} dari {{ apprPagination.count }} tugas</span>
        <nav class="flex items-center gap-1">
          <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!apprPagination.hasPrev" @click="apprPrevPage">‹</button>
          <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">{{ apprPagination.currentPage }}</span>
          <span class="px-1 text-[13px] text-mahir-muted">dari {{ apprPagination.totalPages }}</span>
          <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50" :disabled="!apprPagination.hasNext" @click="apprNextPage">›</button>
        </nav>
      </div>
    </template>
  </div>

  <!-- Modal ajukan / ubah izin (mode ditentukan oleh :leave) -->
  <LeaveAtWorkHourFormModal v-model:open="modalOpen" :leave="editingRow" :saving="saving" @save="handleSave" />

  <!-- Konfirmasi setujui / tolak / batalkan -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    :title="confirmMeta.title"
    :message="confirmMeta.message"
    :confirm-text="confirmMeta.text"
    :loading="saving"
    @confirm="handleConfirm"
  />
</template>
