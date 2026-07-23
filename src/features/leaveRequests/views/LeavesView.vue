<script setup>
import { ref, computed } from "vue";
import { useLeaves } from "../composables/useLeaves";
import { useLeaveRequestForm } from "../composables/useLeaveRequestForm";
import LeaveToolbar from "../components/LeaveToolbar.vue";
import LeaveTable from "../components/LeaveTable.vue";
import LeaveRequestFormModal from "../components/LeaveRequestFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const { leaves, pagination, loading, nextPage, prevPage, refetch } = useLeaves();
const { createLeave, submitLeave, cancelLeave, loading: saving } = useLeaveRequestForm();

const modalOpen = ref(false);

async function handleSave({ input }) {
  const result = await createLeave(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Kirim pengajuan (DRAFT → alur persetujuan): konfirmasi dulu.
const confirmOpen = ref(false);
const submitTarget = ref(null);

const submitMessage = computed(
  () =>
    `Kirim pengajuan cuti "${submitTarget.value?.leaveType?.name ?? ''}" (${submitTarget.value?.totalDays ?? '—'} hari) untuk persetujuan? Setelah dikirim, pengajuan masuk ke alur approval.`,
);

function openSubmit(leave) {
  submitTarget.value = leave;
  confirmOpen.value = true;
}

async function handleSubmit() {
  if (!submitTarget.value) return;
  const ok = await submitLeave(submitTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    submitTarget.value = null;
    refetch();
  }
}

// Batalkan pengajuan (DRAFT): konfirmasi dulu.
const cancelConfirmOpen = ref(false);
const cancelTarget = ref(null);

const cancelMessage = computed(
  () =>
    `Batalkan pengajuan cuti "${cancelTarget.value?.leaveType?.name ?? ''}" (${cancelTarget.value?.totalDays ?? '—'} hari)? Pengajuan yang masih draft akan dibatalkan.`,
);

function openCancel(leave) {
  cancelTarget.value = leave;
  cancelConfirmOpen.value = true;
}

async function handleCancel() {
  if (!cancelTarget.value) return;
  const ok = await cancelLeave(cancelTarget.value.id);
  if (ok) {
    cancelConfirmOpen.value = false;
    cancelTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Pengajuan Cuti
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveToolbar @add="modalOpen = true" />
    </div>

    <LeaveTable :leaves="leaves" :loading="loading" @submit="openSubmit" @cancel="openCancel" />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ leaves.length }} dari {{ pagination.count }} pengajuan</span
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

  <!-- Modal ajukan cuti -->
  <LeaveRequestFormModal v-model:open="modalOpen" :saving="saving" @save="handleSave" />

  <!-- Konfirmasi kirim pengajuan -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Kirim Pengajuan Cuti"
    :message="submitMessage"
    confirm-text="Ya, Kirim"
    :loading="saving"
    @confirm="handleSubmit"
  />

  <!-- Konfirmasi batalkan pengajuan -->
  <ConfirmDialog
    v-model:open="cancelConfirmOpen"
    title="Batalkan Pengajuan Cuti"
    :message="cancelMessage"
    confirm-text="Ya, Batalkan"
    :loading="saving"
    @confirm="handleCancel"
  />
</template>
