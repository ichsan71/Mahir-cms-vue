<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useEmployees } from "../composables/useEmployees";
import { useEmployeeRegister } from "../composables/useEmployeeRegister";
import { useEmployeeExport } from "../composables/useEmployeeExport";
import { useEmployeeDetail } from "../composables/useEmployeeDetail";
import EmployeeToolbar from "../components/EmployeeToolbar.vue";
import EmployeeTable from "../components/EmployeeTable.vue";
import EmployeeRegisterModal from "../components/EmployeeRegisterModal.vue";
import EmployeeExportModal from "../components/EmployeeExportModal.vue";
import ImportEmployeeModal from "../components/ImportEmployeeModal.vue";
import EmployeeOrgChart from "../components/EmployeeOrgChart.vue";
import BulkManualAttendanceCard from "../components/BulkManualAttendanceCard.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEmployeeFiltersStore } from "../stores/employeeFilters.store";
import { PERM } from "../permissions";

const auth = useAuthStore();
const router = useRouter();
const employeeFilters = useEmployeeFiltersStore();
const { employees, pagination, loading, nextPage, prevPage, refetch } = useEmployees();
const { registerEmployee, editEmployee, deleteEmployee, resendVerification, loading: saving, resending } = useEmployeeRegister();
const { exportEmployee, loading: exporting } = useEmployeeExport();

// Tab halaman: daftar tabel vs bagan hierarki vs kelola kehadiran massal.
// Tab "Kelola Kehadiran" hanya untuk yang boleh set kehadiran manual.
const canBulkAttendance = computed(() => auth.can(PERM.ATTENDANCE_SET_MANUAL));
const tab = ref("daftar");
const tabs = computed(() => [
  { id: "daftar", label: "Daftar Karyawan" },
  { id: "hirarki", label: "Hirarki" },
  ...(canBulkAttendance.value ? [{ id: "kehadiran", label: "Kelola Kehadiran" }] : []),
]);

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

// Filter aktif daftar (EmployeeParams) agar ekspor mengikuti apa yang sedang
// ditampilkan/difilter user. `page`/`pageSize` sengaja TIDAK dikirim — ekspor
// mencakup seluruh data yang cocok, bukan satu halaman. Field kosong dibuang.
function activeListFilters() {
  const f = {
    search: employeeFilters.search?.trim() || null,
    fullName: employeeFilters.fullName?.trim() || null,
    nik: employeeFilters.nik?.trim() || null,
    unitsName: employeeFilters.unitsName?.trim() || null,
  };
  const entries = Object.entries(f).filter(([, v]) => v != null);
  return entries.length ? Object.fromEntries(entries) : null;
}

async function handleExport(payload) {
  // Gabung filter dari modal (jika ada) dengan filter aktif daftar.
  const filters = { ...(activeListFilters() ?? {}), ...(payload.filters ?? {}) };
  const result = await exportEmployee({
    ...payload,
    filters: Object.keys(filters).length ? filters : null,
  });
  if (result) exportOpen.value = false;
}

// Impor karyawan massal dari berkas (proses async di backend).
const importOpen = ref(false);

function handleImported() {
  // Impor diproses async; data belum tentu masuk saat modal ditutup.
  // Refetch opurtunistik agar baris yang sudah masuk langsung terlihat.
  refetch();
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

// Kirim ulang email verifikasi untuk karyawan yang belum aktif.
const resendOpen = ref(false);
const resendTarget = ref(null);

const resendMessage = computed(
  () => `Kirim ulang email verifikasi ke "${resendTarget.value?.fullName ?? ''}"? Karyawan akan menerima tautan aktivasi baru di emailnya.`,
);

function openResend(emp) {
  resendTarget.value = emp;
  resendOpen.value = true;
}

async function handleResend() {
  if (!resendTarget.value?.user?.id) return;
  const ok = await resendVerification(resendTarget.value.user.id);
  if (ok) {
    resendOpen.value = false;
    resendTarget.value = null;
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
      v-if="tab === 'daftar' && auth.can([PERM.REGISTER, PERM.CREATE])"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
      @click="openAdd"
    >
      <PlusIcon class="h-4 w-4" /> Daftar Karyawan
    </button>
  </div>

  <!-- Tab: Daftar Karyawan / Hirarki -->
  <div class="mb-5 flex gap-1 border-b border-mahir-border">
    <button
      v-for="t in tabs"
      :key="t.id"
      class="-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors"
      :class="tab === t.id
        ? 'border-mahir-primary text-mahir-primary'
        : 'border-transparent text-slate-500 hover:text-slate-800'"
      @click="tab = t.id"
    >
      {{ t.label }}
    </button>
  </div>

  <!-- Bagan hierarki -->
  <EmployeeOrgChart v-if="tab === 'hirarki'" />

  <!-- Kelola kehadiran massal (lintas-karyawan) -->
  <BulkManualAttendanceCard v-else-if="tab === 'kehadiran' && canBulkAttendance" />

  <!-- Table card -->
  <div v-show="tab === 'daftar'" class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Karyawan
      </h2>
      <EmployeeToolbar @export="exportOpen = true" @import="importOpen = true" />
    </div>

    <EmployeeTable
      :employees="employees"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
      @resend="openResend"
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

  <!-- Modal impor karyawan massal dari berkas -->
  <ImportEmployeeModal
    v-model:open="importOpen"
    @imported="handleImported"
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

  <!-- Konfirmasi kirim ulang email verifikasi -->
  <ConfirmDialog
    v-model:open="resendOpen"
    title="Kirim Ulang Verifikasi"
    :message="resendMessage"
    confirm-text="Ya, Kirim"
    variant="primary"
    :loading="resending"
    @confirm="handleResend"
  />
</template>
