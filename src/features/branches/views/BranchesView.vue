<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useBranches } from "../composables/useBranches";
import { useBranchForm } from "../composables/useBranchForm";
import BranchToolbar from "../components/BranchToolbar.vue";
import BranchTable from "../components/BranchTable.vue";
import BranchFormModal from "../components/BranchFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { branches, pagination, loading, nextPage, prevPage, refetch } = useBranches();
const { createBranch, editBranch, deleteBranch, loading: saving } = useBranchForm();

const modalOpen = ref(false);
// Cabang yang sedang diubah (diprefill langsung dari baris list).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(branch) {
  editing.value = branch;
  modalOpen.value = true;
}

function handleDetail(branch) {
  router.push({ name: "cabang-detail", params: { id: branch.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editBranch(id, input) : await createBranch(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus cabang "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(branch) {
  deleteTarget.value = branch;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteBranch(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Cabang</h1>
      <p class="text-sm text-mahir-muted">Data cabang & penempatan perusahaan Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Cabang
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <BranchToolbar @add="openAdd" />
    </div>

    <BranchTable
      :branches="branches"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ branches.length }} dari {{ pagination.count }} cabang</span
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

  <!-- Modal tambah/ubah cabang -->
  <BranchFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :branch="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus cabang -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Cabang"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
