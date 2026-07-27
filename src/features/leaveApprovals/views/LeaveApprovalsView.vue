<script setup>
import { ref, computed } from "vue";
import { useLeaveApprovals } from "../composables/useLeaveApprovals";
import { useLeaveApprovalActions } from "../composables/useLeaveApprovalActions";
import LeaveApprovalToolbar from "../components/LeaveApprovalToolbar.vue";
import LeaveApprovalTable from "../components/LeaveApprovalTable.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const { approvals, pagination, loading, nextPage, prevPage, refetch } = useLeaveApprovals();
const { approveLeave, rejectLeave, loading: acting } = useLeaveApprovalActions();

// action = 'approve' | 'reject'; target = baris LeaveApproval terpilih.
const confirmOpen = ref(false);
const action = ref("approve");
const target = ref(null);

const isApprove = computed(() => action.value === "approve");
const dialogTitle = computed(() => (isApprove.value ? "Setujui Cuti" : "Tolak Cuti"));
const dialogConfirm = computed(() => (isApprove.value ? "Ya, Setujui" : "Ya, Tolak"));
const dialogMessage = computed(() => {
  const name = target.value?.leave?.employee?.fullName ?? "";
  const verb = isApprove.value ? "menyetujui" : "menolak";
  return `Yakin ${verb} pengajuan cuti ${name ? `dari "${name}"` : "ini"}?`;
});

function openApprove(row) {
  action.value = "approve";
  target.value = row;
  confirmOpen.value = true;
}
function openReject(row) {
  action.value = "reject";
  target.value = row;
  confirmOpen.value = true;
}

async function handleConfirm() {
  // Backend menerima id baris LeaveApproval (bukan id Leave).
  const approvalId = target.value?.id;
  if (!approvalId) return;
  const ok = isApprove.value ? await approveLeave(approvalId) : await rejectLeave(approvalId);
  if (ok) {
    confirmOpen.value = false;
    target.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Pengajuan
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveApprovalToolbar />
    </div>

    <LeaveApprovalTable
      :approvals="approvals"
      :loading="loading"
      @approve="openApprove"
      @reject="openReject"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ approvals.length }} dari {{ pagination.count }} pengajuan</span
      >
      <nav class="flex items-center gap-1">
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasPrev"
          @click="prevPage"
        >
          ‹
        </button>
        <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
          {{ pagination.currentPage }}
        </span>
        <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasNext"
          @click="nextPage"
        >
          ›
        </button>
      </nav>
    </div>
  </div>

  <ConfirmDialog
    :open="confirmOpen"
    :title="dialogTitle"
    :message="dialogMessage"
    :confirm-text="dialogConfirm"
    :variant="isApprove ? 'primary' : 'danger'"
    :loading="acting"
    @update:open="confirmOpen = $event"
    @confirm="handleConfirm"
  />
</template>
