<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useShifts } from "../composables/useShifts";
import { useShiftForm } from "../composables/useShiftForm";
import ShiftToolbar from "../components/ShiftToolbar.vue";
import ShiftTable from "../components/ShiftTable.vue";
import ShiftFormModal from "../components/ShiftFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { shifts, pagination, loading, nextPage, prevPage, refetch } = useShifts();
const { createShift, editShift, deleteShift, loading: saving } = useShiftForm();

const modalOpen = ref(false);
// Shift yang sedang diubah (diprefill langsung dari baris list).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(shift) {
  editing.value = shift;
  modalOpen.value = true;
}

function handleDetail(shift) {
  router.push({ name: "shift-detail", params: { id: shift.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editShift(id, input) : await createShift(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus shift "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(shift) {
  deleteTarget.value = shift;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteShift(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Shift</h1>
      <p class="text-sm text-mahir-muted">Pengaturan jadwal shift kerja Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Shift
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <ShiftToolbar @add="openAdd" />
    </div>

    <ShiftTable
      :shifts="shifts"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ shifts.length }} dari {{ pagination.count }} shift</span
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

  <!-- Modal tambah/ubah shift -->
  <ShiftFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :shift="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus shift -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Shift"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
