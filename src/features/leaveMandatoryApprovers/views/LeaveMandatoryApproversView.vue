<script setup>
import { ref, computed } from "vue";
import { useLeaveMandatoryApprovers } from "../composables/useLeaveMandatoryApprovers";
import { useLeaveMandatoryApproverForm } from "../composables/useLeaveMandatoryApproverForm";
import LeaveMandatoryApproverToolbar from "../components/LeaveMandatoryApproverToolbar.vue";
import LeaveMandatoryApproverTable from "../components/LeaveMandatoryApproverTable.vue";
import LeaveMandatoryApproverFormModal from "../components/LeaveMandatoryApproverFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const { approvers, pagination, loading, nextPage, prevPage, refetch } = useLeaveMandatoryApprovers();
const { createApprover, editApprover, deleteApprover, loading: saving } = useLeaveMandatoryApproverForm();

const modalOpen = ref(false);
// Baris yang sedang diubah (prefill dari list). null = mode tambah.
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(row) {
  editing.value = row;
  modalOpen.value = true;
}

async function handleSave({ id, input }) {
  const result = id ? await editApprover(id, input) : await createApprover(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(() => {
  const c = deleteTarget.value?.company?.name ?? "";
  return `Hapus approver wajib${c ? ` untuk "${c}"` : ""}? Alur persetujuan cuti perusahaan ini bisa terpengaruh.`;
});

function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteApprover(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Approver Wajib
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveMandatoryApproverToolbar @add="openAdd" />
    </div>

    <LeaveMandatoryApproverTable
      :approvers="approvers"
      :loading="loading"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ approvers.length }} dari {{ pagination.count }} approver</span
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

  <!-- Modal tambah/ubah approver wajib -->
  <LeaveMandatoryApproverFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :approver="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Approver Wajib"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
