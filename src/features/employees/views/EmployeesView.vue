<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useEmployees } from "../composables/useEmployees";
import { useEmployeeRegister } from "../composables/useEmployeeRegister";
import { useEmployeeExport } from "../composables/useEmployeeExport";
import { useEmployeeDetail } from "../composables/useEmployeeDetail";
import EmployeeStats from "../components/EmployeeStats.vue";
import EmployeeToolbar from "../components/EmployeeToolbar.vue";
import EmployeeTable from "../components/EmployeeTable.vue";
import EmployeeRegisterModal from "../components/EmployeeRegisterModal.vue";
import EmployeeExportModal from "../components/EmployeeExportModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

const auth = useAuthStore();
const router = useRouter();
const { employees, pagination, loading, nextPage, prevPage, refetch } = useEmployees();
const { registerEmployee, editEmployee, deleteEmployee, loading: saving } = useEmployeeRegister();
const { exportEmployee, loading: exporting } = useEmployeeExport();

// Statistik dari metadata pagination (backend belum sediakan endpoint stats khusus).
const stats = computed(() => ({ total: pagination.value.count }));

const modalOpen = ref(false);

// Id karyawan yang sedang diubah; null = mode daftar baru.
// useEmployeeDetail mengambil data lengkap (getEmployee) untuk prefill form.
const editId = ref(null);
const { employee: editingEmployee } = useEmployeeDetail(editId);

function openAdd() {
  editId.value = null;
  modalOpen.value = true;
}

function openEdit(emp) {
  editId.value = emp.id;
  modalOpen.value = true;
}

function handleDetail(emp) {
  router.push({ name: "karyawan-detail", params: { id: emp.id } });
}

async function handleSave({ id, username, email, input }) {
  const result = id
    ? await editEmployee(id, input)
    : await registerEmployee({ username, email, input });
  if (result) {
    // Jika yang diedit adalah karyawan yang sedang login, sinkronkan data sesi
    // (nama & foto) agar avatar/nama di navbar ikut berubah tanpa login ulang.
    if (id && String(id) === String(auth.employee?.id)) {
      auth.patchEmployee({ fullName: result.fullName, image: result.image ?? null });
    }
    modalOpen.value = false;
    refetch();
  }
}

// Ekspor karyawan ke email (proses async di backend).
const exportOpen = ref(false);

async function handleExport(payload) {
  const result = await exportEmployee(payload);
  if (result) exportOpen.value = false;
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus karyawan "${deleteTarget.value?.fullName ?? ''}"? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(emp) {
  deleteTarget.value = emp;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteEmployee(deleteTarget.value.id);
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
      <h1 class="text-2xl font-bold text-slate-900">Manajemen Karyawan</h1>
      <p class="text-sm text-mahir-muted">Data seluruh karyawan aktif & non-aktif Mazta Group</p>
    </div>
    <button
      v-if="auth.can([PERM.REGISTER, PERM.CREATE])"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
      @click="openAdd"
    >
      <PlusIcon class="h-4 w-4" /> Daftar Karyawan
    </button>
  </div>

  <!-- Stats -->
  <div class="mb-6">
    <EmployeeStats :stats="stats" />
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Karyawan
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <EmployeeToolbar @export="exportOpen = true" />
    </div>

    <EmployeeTable
      :employees="employees"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ employees.length }} dari {{ pagination.count }} karyawan</span
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

  <!-- Modal daftar / edit karyawan -->
  <EmployeeRegisterModal
    v-model:open="modalOpen"
    :saving="saving"
    :employee="editId ? editingEmployee : null"
    @save="handleSave"
  />

  <!-- Modal ekspor karyawan ke email -->
  <EmployeeExportModal
    v-model:open="exportOpen"
    :saving="exporting"
    @submit="handleExport"
  />

  <!-- Konfirmasi hapus karyawan -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Karyawan"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
