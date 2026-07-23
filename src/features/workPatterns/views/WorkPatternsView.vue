<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useWorkPatterns } from "../composables/useWorkPatterns";
import { useWorkPatternForm } from "../composables/useWorkPatternForm";
import WorkPatternToolbar from "../components/WorkPatternToolbar.vue";
import WorkPatternTable from "../components/WorkPatternTable.vue";
import WorkPatternFormModal from "../components/WorkPatternFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { workPatterns, pagination, loading, nextPage, prevPage, refetch } = useWorkPatterns();
const { createWorkPattern, editWorkPattern, deleteWorkPattern, loading: saving } = useWorkPatternForm();

const modalOpen = ref(false);
// Pola kerja yang sedang diubah (diprefill via getWorkPattern di dalam modal).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(pattern) {
  editing.value = pattern;
  modalOpen.value = true;
}

function handleDetail(pattern) {
  router.push({ name: "pola-kerja-detail", params: { id: pattern.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editWorkPattern(id, input) : await createWorkPattern(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus pola kerja "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(pattern) {
  deleteTarget.value = pattern;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteWorkPattern(deleteTarget.value.id);
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
        Daftar Pola Kerja
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <WorkPatternToolbar @add="openAdd" />
    </div>

    <WorkPatternTable
      :work-patterns="workPatterns"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ workPatterns.length }} dari {{ pagination.count }} pola kerja</span
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

  <!-- Modal tambah/ubah pola kerja -->
  <WorkPatternFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :work-pattern="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus pola kerja -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Pola Kerja"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
