<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUnits } from "../composables/useUnits";
import { useUnitForm } from "../composables/useUnitForm";
import { useUnitFormData } from "../composables/useUnitFormData";
import UnitToolbar from "../components/UnitToolbar.vue";
import UnitTable from "../components/UnitTable.vue";
import UnitFormModal from "../components/UnitFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { units, pagination, loading, nextPage, prevPage, refetch } = useUnits();
const { createUnit, editUnit, deleteUnit, loading: saving } = useUnitForm();

const modalOpen = ref(false);

// Id unit yang sedang diubah; null = mode tambah.
// useUnitFormData mengambil data unit (getUnit) untuk prefill form edit.
const editId = ref(null);
const { unit: editingUnit } = useUnitFormData(editId);

function openAdd() {
  editId.value = null;
  modalOpen.value = true;
}

function openEdit(unit) {
  editId.value = unit.id;
  modalOpen.value = true;
}

function handleDetail(unit) {
  router.push({ name: "unit-detail", params: { id: unit.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editUnit(id, input) : await createUnit(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus unit "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(unit) {
  deleteTarget.value = unit;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteUnit(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Unit</h1>
      <p class="text-sm text-mahir-muted">Struktur unit & hierarki organisasi Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Unit
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <UnitToolbar @add="openAdd" />
    </div>

    <UnitTable
      :units="units"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ units.length }} dari {{ pagination.count }} unit</span
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

  <!-- Modal tambah/ubah unit -->
  <UnitFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :unit="editId ? editingUnit : null"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus unit -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Unit"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
