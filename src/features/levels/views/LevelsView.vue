<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLevels } from "../composables/useLevels";
import { useLevelForm } from "../composables/useLevelForm";
import { useLevelFormData } from "../composables/useLevelFormData";
import LevelToolbar from "../components/LevelToolbar.vue";
import LevelTable from "../components/LevelTable.vue";
import LevelFormModal from "../components/LevelFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { levels, pagination, loading, nextPage, prevPage, refetch } = useLevels();
const { createLevel, editLevel, deleteLevel, loading: saving } = useLevelForm();

const modalOpen = ref(false);

// Id level yang sedang diubah; null = mode tambah.
// useLevelFormData mengambil data level (getLevel) untuk prefill form edit.
const editId = ref(null);
const { level: editingLevel } = useLevelFormData(editId);

function openAdd() {
  editId.value = null;
  modalOpen.value = true;
}

function openEdit(level) {
  editId.value = level.id;
  modalOpen.value = true;
}

function handleDetail(level) {
  router.push({ name: "level-detail", params: { id: level.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editLevel(id, input) : await createLevel(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus level "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(level) {
  deleteTarget.value = level;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteLevel(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Level</h1>
      <p class="text-sm text-mahir-muted">Tingkatan jabatan & hierarki level Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Level
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LevelToolbar @add="openAdd" />
    </div>

    <LevelTable
      :levels="levels"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ levels.length }} dari {{ pagination.count }} level</span
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

  <!-- Modal tambah/ubah level -->
  <LevelFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :level="editId ? editingLevel : null"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus level -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Level"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
