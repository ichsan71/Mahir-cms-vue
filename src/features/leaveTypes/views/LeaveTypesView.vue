<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLeaveTypes } from "../composables/useLeaveTypes";
import { useLeaveTypeForm } from "../composables/useLeaveTypeForm";
import LeaveTypeToolbar from "../components/LeaveTypeToolbar.vue";
import LeaveTypeTable from "../components/LeaveTypeTable.vue";
import LeaveTypeFormModal from "../components/LeaveTypeFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { leaveTypes, pagination, loading, nextPage, prevPage, refetch } = useLeaveTypes();
const { createLeaveType, editLeaveType, deleteLeaveType, loading: saving } = useLeaveTypeForm();

const modalOpen = ref(false);
// Tipe cuti yang sedang diubah (diprefill via getLeaveType di dalam modal).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(type) {
  editing.value = type;
  modalOpen.value = true;
}

function handleDetail(type) {
  router.push({ name: "tipe-cuti-detail", params: { id: type.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editLeaveType(id, input) : await createLeaveType(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus tipe cuti "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi aturan cuti terkait.`,
);

function openDelete(type) {
  deleteTarget.value = type;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteLeaveType(deleteTarget.value.id);
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
        Daftar Tipe Cuti
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveTypeToolbar @add="openAdd" />
    </div>

    <LeaveTypeTable
      :leave-types="leaveTypes"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ leaveTypes.length }} dari {{ pagination.count }} tipe cuti</span
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

  <!-- Modal tambah/ubah tipe cuti -->
  <LeaveTypeFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :leave-type="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Tipe Cuti"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
