<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCompanies } from "../composables/useCompanies";
import { useCompanyForm } from "../composables/useCompanyForm";
import { useCompanyDetail } from "../composables/useCompanyDetail";
import CompanyToolbar from "../components/CompanyToolbar.vue";
import CompanyTable from "../components/CompanyTable.vue";
import CompanyFormModal from "../components/CompanyFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { companies, pagination, loading, nextPage, prevPage, refetch } = useCompanies();
const { createCompany, editCompany, deleteCompany, loading: saving } = useCompanyForm();

const modalOpen = ref(false);

// Id perusahaan yang sedang diubah; null = mode tambah.
// useCompanyDetail mengambil data lengkap (getCompany) untuk prefill form.
const editId = ref(null);
const { company: editingCompany } = useCompanyDetail(editId);

function openAdd() {
  editId.value = null;
  modalOpen.value = true;
}

function openEdit(company) {
  editId.value = company.id;
  modalOpen.value = true;
}

function handleDetail(company) {
  router.push({ name: "perusahaan-detail", params: { id: company.id } });
}

async function handleSave({ id, input }) {
  console.log(input)
  const result = id ? await editCompany(id, input) : await createCompany(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () =>
    `Hapus perusahaan "${deleteTarget.value?.name ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(company) {
  deleteTarget.value = company;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteCompany(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Perusahaan</h1>
      <p class="text-sm text-mahir-muted">Data seluruh perusahaan di lingkungan Mazta Group</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Perusahaan
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <CompanyToolbar @add="openAdd" />
    </div>

    <CompanyTable
      :companies="companies"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ companies.length }} dari {{ pagination.count }} perusahaan</span
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

  <!-- Modal tambah perusahaan -->
  <CompanyFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :company="editId ? editingCompany : null"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus perusahaan -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Perusahaan"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
