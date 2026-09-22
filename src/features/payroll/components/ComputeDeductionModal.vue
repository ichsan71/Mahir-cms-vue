<script setup>
// Modal "Hitung Potongan" — pilih karyawan + periode bulan, lalu panggil
// computeEmployeeSalaryDeduction. Backend menghitung potongan dari kehadiran.
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useEmployeeSearch } from "@/features/employees/composables/useEmployeeSearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "submit"]);

const { options: employeeOptions, loading: employeeLoading, setSearch: setEmployeeSearch } =
  useEmployeeSearch();

const employeeId = ref("");
const employeeSelected = ref(null);
const periodMonth = ref(""); // "YYYY-MM"

function reset() {
  employeeId.value = "";
  employeeSelected.value = null;
  periodMonth.value = "";
}

watch(
  () => props.open,
  (open) => {
    if (open) reset();
  },
);

function onSubmit() {
  if (!employeeId.value || !periodMonth.value) return;
  emit("submit", { employeeId: Number(employeeId.value), periodMonth: periodMonth.value });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Hitung Potongan"
    size="md"
    :loading="saving"
    submit-text="Hitung"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div>
        <label :class="labelCls">Karyawan *</label>
        <SearchableSelect
          v-model="employeeId"
          :selected="employeeSelected"
          :options="employeeOptions"
          :loading="employeeLoading"
          placeholder="Pilih karyawan"
          search-placeholder="Cari karyawan…"
          @search="setEmployeeSearch"
        />
      </div>
      <div>
        <label :class="labelCls">Periode (Bulan) *</label>
        <input v-model="periodMonth" type="month" required :class="fieldCls" />
        <p class="mt-1 text-[12px] text-mahir-muted">
          Potongan dihitung dari data kehadiran & cuti pada bulan ini.
        </p>
      </div>
    </div>
  </BaseModal>
</template>
