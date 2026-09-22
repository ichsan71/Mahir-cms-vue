<script setup>
import { ref, computed } from "vue";
import { useSalaryComponentTypes } from "../composables/useSalaryComponentTypes";
import { useSalaryComponentTypeForm } from "../composables/useSalaryComponentTypeForm";
import SalaryComponentTypeToolbar from "../components/SalaryComponentTypeToolbar.vue";
import SalaryComponentTypeTable from "../components/SalaryComponentTypeTable.vue";
import SalaryComponentTypeFormModal from "../components/SalaryComponentTypeFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const { componentTypes, pagination, loading, nextPage, prevPage, refetch } = useSalaryComponentTypes();
const { createComponentType, editComponentType, deleteComponentType, loading: saving } =
  useSalaryComponentTypeForm();

const modalOpen = ref(false);
// Komponen yang sedang diubah (diprefill langsung dari baris list).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(type) {
  editing.value = type;
  modalOpen.value = true;
}

async function handleSave({ id, input }) {
  const result = id ? await editComponentType(id, input) : await createComponentType(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus komponen "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi struktur gaji terkait.`,
);

function openDelete(type) {
  deleteTarget.value = type;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteComponentType(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Komponen Penggajian</h1>
      <p class="text-sm text-mahir-muted">Katalog jenis komponen gaji (pendapatan, tunjangan, potongan) Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Komponen
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <SalaryComponentTypeToolbar @add="openAdd" />
    </div>

    <SalaryComponentTypeTable
      :component-types="componentTypes"
      :loading="loading"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ componentTypes.length }} dari {{ pagination.count }} komponen</span
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

  <!-- Modal tambah/ubah komponen -->
  <SalaryComponentTypeFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :component-type="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus komponen -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Komponen Penggajian"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
