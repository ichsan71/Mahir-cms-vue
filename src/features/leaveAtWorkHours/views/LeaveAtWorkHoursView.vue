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
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import {
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PaperClipIcon,
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
  status: apprStatus,
  nextPage: apprNextPage,
  prevPage: apprPrevPage,
} = useLeaveAtWorkHourApprovals();

const { createLeave, approve, reject, remove, loading: saving } = useLeaveAtWorkHourForm();

const canCreate = computed(() => auth.can(PERM.CREATE));
const canDelete = computed(() => auth.can(PERM.DELETE));
const canApprove = computed(() => auth.can(PERM.APPROVE));
const canReject = computed(() => auth.can(PERM.REJECT));
const canViewApprovals = computed(() => auth.can(PERM.APPROVAL_LIST));

const tabs = computed(() => [
  { id: "pengajuan", label: "Pengajuan" },
  ...(canViewApprovals.value ? [{ id: "persetujuan", label: "Persetujuan" }] : []),
]);
const tab = ref("pengajuan");

// Status → label & kelas badge (dipakai izin & approval).
const STATUS_META = {
  DRAFT: { label: "Draft", cls: "bg-slate-100 text-slate-500" },
  PENDING: { label: "Menunggu", cls: "bg-amber-50 text-amber-600" },
  APPROVED: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-600" },
  REJECTED: { label: "Ditolak", cls: "bg-rose-50 text-rose-600" },
  CANCELLED: { label: "Dibatalkan", cls: "bg-slate-100 text-slate-500" },
};
function statusMeta(s) {
  return STATUS_META[s] ?? { label: s || "-", cls: "bg-slate-100 text-slate-500" };
}

const STATUS_FILTERS = [
  { value: "", label: "Semua status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// ── Ajukan ───────────────────────────────────────────────────────────────────
const modalOpen = ref(false);
async function handleSave({ input }) {
  const res = await createLeave(input);
  if (res) {
    modalOpen.value = false;
    refetchMine();
  }
}

// ── Setujui / Tolak / Batalkan ───────────────────────────────────────────────
const confirmOpen = ref(false);
const action = ref(null); // 'approve' | 'reject' | 'delete'
const target = ref(null); // baris izin (delete) atau baris approval (approve/reject)

const confirmMeta = computed(() => {
  const izin = action.value === "delete" ? target.value : target.value?.leaveAtWorkHour;
  const name = izin?.leaveType?.name ?? "izin";
  const date = formatDate(izin?.date);
  switch (action.value) {
    case "approve":
      return { title: "Setujui Izin", message: `Setujui ${name} tanggal ${date}?`, text: "Ya, Setujui" };
    case "reject":
      return { title: "Tolak Izin", message: `Tolak ${name} tanggal ${date}?`, text: "Ya, Tolak" };
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
  else if (action.value === "delete") ok = await remove(target.value.id);
  if (ok) {
    confirmOpen.value = false;
    target.value = null;
    action.value = null;
    refetchMine();
    refetchApprovals();
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
          class="-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors"
          :class="tab === t.id ? 'border-mahir-primary text-mahir-primary' : 'border-transparent text-slate-500 hover:text-slate-800'"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
        @click="modalOpen = true"
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

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-y border-mahir-border bg-slate-50 text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th class="px-5 py-2.5 font-semibold">Tanggal</th>
              <th class="px-5 py-2.5 font-semibold">Tipe Izin</th>
              <th class="px-5 py-2.5 font-semibold">Alasan</th>
              <th class="px-5 py-2.5 font-semibold">Status</th>
              <th class="px-5 py-2.5 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="myLoading && !myItems.length">
              <td colspan="5" class="px-5 py-12 text-center text-slate-400"><ArrowPathIcon class="mx-auto h-5 w-5 animate-spin" /></td>
            </tr>
            <tr v-else-if="!myItems.length">
              <td colspan="5" class="px-5 py-12 text-center text-sm text-slate-400">Belum ada pengajuan izin.</td>
            </tr>
            <tr
              v-for="row in myItems"
              :key="row.id"
              class="border-b border-mahir-border/60 last:border-0 hover:bg-slate-50/60"
            >
              <td class="px-5 py-3 font-medium text-slate-700">{{ formatDate(row.date) }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.leaveType?.name ?? "-" }}</td>
              <td class="px-5 py-3 text-slate-500">
                <div class="flex max-w-[280px] items-center gap-1.5">
                  <span class="truncate">{{ row.reason || "-" }}</span>
                  <a v-if="row.attachment" :href="row.attachment" target="_blank" rel="noopener" class="shrink-0 text-mahir-primary hover:text-mahir-primary/80" title="Lihat lampiran">
                    <PaperClipIcon class="h-4 w-4" />
                  </a>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="statusMeta(row.status).cls">{{ statusMeta(row.status).label }}</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end">
                  <button
                    v-if="canDelete && ['DRAFT', 'PENDING'].includes(row.status)"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                    title="Batalkan"
                    @click="openAction('delete', row)"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-y border-mahir-border bg-slate-50 text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th class="px-5 py-2.5 font-semibold">Tanggal</th>
              <th class="px-5 py-2.5 font-semibold">Karyawan</th>
              <th class="px-5 py-2.5 font-semibold">Tipe Izin</th>
              <th class="px-5 py-2.5 font-semibold">Alasan</th>
              <th class="px-5 py-2.5 font-semibold">Status</th>
              <th class="px-5 py-2.5 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="apprLoading && !apprItems.length">
              <td colspan="6" class="px-5 py-12 text-center text-slate-400"><ArrowPathIcon class="mx-auto h-5 w-5 animate-spin" /></td>
            </tr>
            <tr v-else-if="!apprItems.length">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-slate-400">Tidak ada tugas persetujuan.</td>
            </tr>
            <tr
              v-for="row in apprItems"
              :key="row.id"
              class="border-b border-mahir-border/60 last:border-0 hover:bg-slate-50/60"
            >
              <td class="px-5 py-3 font-medium text-slate-700">{{ formatDate(row.leaveAtWorkHour?.date) }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.leaveAtWorkHour?.employee?.fullName ?? "-" }}</td>
              <td class="px-5 py-3 text-slate-600">{{ row.leaveAtWorkHour?.leaveType?.name ?? "-" }}</td>
              <td class="px-5 py-3 text-slate-500">
                <div class="flex max-w-[240px] items-center gap-1.5">
                  <span class="truncate">{{ row.leaveAtWorkHour?.reason || "-" }}</span>
                  <a v-if="row.leaveAtWorkHour?.attachment" :href="row.leaveAtWorkHour.attachment" target="_blank" rel="noopener" class="shrink-0 text-mahir-primary hover:text-mahir-primary/80" title="Lihat lampiran">
                    <PaperClipIcon class="h-4 w-4" />
                  </a>
                </div>
              </td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="statusMeta(row.status).cls">{{ statusMeta(row.status).label }}</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <template v-if="row.status === 'PENDING'">
                    <button
                      v-if="canApprove"
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Setujui"
                      @click="openAction('approve', row)"
                    >
                      <CheckIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="canReject"
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                      title="Tolak"
                      @click="openAction('reject', row)"
                    >
                      <XMarkIcon class="h-4 w-4" />
                    </button>
                  </template>
                  <span v-else class="text-[12px] text-slate-400">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

  <!-- Modal ajukan izin -->
  <LeaveAtWorkHourFormModal v-model:open="modalOpen" :saving="saving" @save="handleSave" />

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
