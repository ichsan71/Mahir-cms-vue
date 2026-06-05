<script setup>
// Port dari resources/views/pages/employees/index.blade.php
import { ref } from "vue";
import { useEmployees } from "../composables/useEmployees";
import EmployeeStats from "../components/EmployeeStats.vue";
import EmployeeToolbar from "../components/EmployeeToolbar.vue";
import EmployeeTable from "../components/EmployeeTable.vue";
import EmployeeFormModal from "../components/EmployeeFormModal.vue";

const { employees, stats, loading, createEmployee, updateEmployee, deleteEmployee } =
  useEmployees();

const modalOpen = ref(false);
const editing = ref(null);

function openCreate() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(emp) {
  editing.value = emp;
  modalOpen.value = true;
}

async function handleSave({ id, input }) {
  if (id) {
    await updateEmployee(id, input);
  } else {
    await createEmployee(input);
  }
  modalOpen.value = false;
}

async function handleDelete(emp) {
  if (window.confirm(`Hapus karyawan "${emp.name}"?`)) {
    await deleteEmployee(emp.id);
  }
}

function handleDetail(emp) {
  // Detail view di luar scope; tampilkan ringkas sementara.
  window.alert(`${emp.name}\n${emp.position} — ${emp.dept}\n${emp.email}`);
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
      class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
      @click="openCreate"
    >
      <i class="bi bi-person-plus-fill"></i> Tambah Karyawan
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
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ employees.length }}</span>
      </h2>
      <EmployeeToolbar />
    </div>

    <EmployeeTable
      :employees="employees"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ employees.length }} dari {{ stats?.total ?? employees.length }} karyawan</span
      >
      <nav class="flex items-center gap-1">
        <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm text-slate-400" disabled>‹</button>
        <button class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">1</button>
        <button class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm text-slate-600">›</button>
      </nav>
    </div>
  </div>

  <!-- Add / Edit modal -->
  <EmployeeFormModal
    v-model:open="modalOpen"
    :employee="editing"
    @save="handleSave"
  />
</template>
