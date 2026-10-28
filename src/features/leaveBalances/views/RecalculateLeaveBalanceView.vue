<script setup>
// Tab "Hitung Ulang Saldo" pada Pengaturan Cuti. User memilih filter (perusahaan,
// karyawan, tipe cuti) lalu memanggil recalculateLeaveBalance. Semua filter
// opsional & berupa array; kosong = tidak memfilter dimensi tsb. Minimal satu
// filter harus dipilih agar tidak memicu recalc seluruh data tanpa sengaja.
import { ref, computed } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { RECALCULATE_LEAVE_BALANCE } from "../graphql/leaveBalance.queries";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useEmployeeSearch } from "@/features/employees/composables/useEmployeeSearch";
import { useLeaveTypeSearch } from "@/features/leaveTypes/composables/useLeaveTypeSearch";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { PERM } from "../permissions";
import { ArrowPathIcon, CalculatorIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const toast = useToastStore();

const canRecalculate = computed(() => auth.can(PERM.RECALCULATE));

// Opsi multi-select (pencarian async lewat composable masing-masing).
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } =
  useCompanySearch();
const { options: employeeOptions, loading: employeeLoading, setSearch: setEmployeeSearch } =
  useEmployeeSearch();
const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } =
  useLeaveTypeSearch();

// Id terpilih (array) + objek terpilih (untuk label chip saat sudah dipilih).
const companyIds = ref([]);
const companySelected = ref([]);
const employeeIds = ref([]);
const employeeSelected = ref([]);
const leaveTypeIds = ref([]);
const leaveTypeSelected = ref([]);

// Simpan objek terpilih agar chip label tetap muncul meski opsi berganti saat cari.
function syncSelected(selectedRef, options, ids) {
  const byId = new Map([...selectedRef.value, ...options].map((o) => [String(o.id), o]));
  selectedRef.value = ids.map((id) => byId.get(String(id))).filter(Boolean);
}
function onCompany(ids) {
  companyIds.value = ids;
  syncSelected(companySelected, companyOptions.value, ids);
}
function onEmployee(ids) {
  employeeIds.value = ids;
  syncSelected(employeeSelected, employeeOptions.value, ids);
}
function onLeaveType(ids) {
  leaveTypeIds.value = ids;
  syncSelected(leaveTypeSelected, leaveTypeOptions.value, ids);
}

const hasFilter = computed(
  () => companyIds.value.length || employeeIds.value.length || leaveTypeIds.value.length,
);

function reset() {
  companyIds.value = [];
  companySelected.value = [];
  employeeIds.value = [];
  employeeSelected.value = [];
  leaveTypeIds.value = [];
  leaveTypeSelected.value = [];
}

const { mutate: recalculateLeaveBalance, loading } = useMutation(RECALCULATE_LEAVE_BALANCE);

// Dialog konfirmasi saat tak ada filter (akan merecalculate SELURUH data).
const confirmOpen = ref(false);

function submit() {
  if (!canRecalculate.value || loading.value) return;
  // Tanpa filter → konfirmasi dulu karena mencakup seluruh saldo cuti.
  if (!hasFilter.value) {
    confirmOpen.value = true;
    return;
  }
  runRecalculate();
}

async function runRecalculate() {
  if (!canRecalculate.value || loading.value) return;
  const toInts = (arr) => (arr.length ? arr.map((v) => Number(v)) : null);
  try {
    const res = await recalculateLeaveBalance({
      companyIds: toInts(companyIds.value),
      employeeIds: toInts(employeeIds.value),
      leaveTypeIds: toInts(leaveTypeIds.value),
    });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    toast.success(
      hasFilter.value
        ? "Saldo cuti berhasil dihitung ulang sesuai filter yang dipilih."
        : "Seluruh saldo cuti karyawan berhasil dihitung ulang.",
    );
    reset();
  } catch (e) {
    const m =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menghitung ulang saldo cuti. Coba lagi.";
    toast.error(m.replace(/^GraphQL error:\s*/i, "").trim());
  } finally {
    confirmOpen.value = false;
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <div
    v-if="!canRecalculate"
    class="rounded-2xl border border-mahir-border bg-white p-10 text-center text-sm text-slate-400"
  >
    Anda tidak memiliki akses untuk menghitung ulang saldo cuti.
  </div>

  <div v-else class="rounded-2xl border border-mahir-border bg-white">
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <CalculatorIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Hitung Ulang Saldo Cuti Karyawan</h2>
        <p class="text-[11.5px] text-slate-400">
          Pilih perusahaan, karyawan, dan tipe cuti yang ingin di hitung ulang secara masal
        </p>
      </div>
    </div>

    <div class="space-y-4 p-5">
      <div>
        <label :class="labelCls">Perusahaan</label>
        <SearchableSelect
          :model-value="companyIds"
          :selected="companySelected"
          :options="companyOptions"
          :loading="companyLoading"
          multiple
          placeholder="Semua perusahaan"
          search-placeholder="Cari perusahaan…"
          @update:model-value="onCompany"
          @search="setCompanySearch"
        />
      </div>

      <div>
        <label :class="labelCls">Karyawan</label>
        <SearchableSelect
          :model-value="employeeIds"
          :selected="employeeSelected"
          :options="employeeOptions"
          :loading="employeeLoading"
          multiple
          placeholder="Semua karyawan"
          search-placeholder="Cari karyawan…"
          @update:model-value="onEmployee"
          @search="setEmployeeSearch"
        />
      </div>

      <div>
        <label :class="labelCls">Tipe Cuti</label>
        <SearchableSelect
          :model-value="leaveTypeIds"
          :selected="leaveTypeSelected"
          :options="leaveTypeOptions"
          :loading="leaveTypeLoading"
          multiple
          placeholder="Semua tipe cuti"
          search-placeholder="Cari tipe cuti…"
          @update:model-value="onLeaveType"
          @search="setLeaveTypeSearch"
        />
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-mahir-border pt-4">
        <button
          type="button"
          :disabled="loading || !hasFilter"
          class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border px-4 py-2 text-[13.5px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          @click="reset"
        >
          Reset
        </button>
        <button
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          @click="submit"
        >
          <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          Hitung Ulang
        </button>
      </div>
    </div>
  </div>

  <!-- Konfirmasi recalc seluruh data saat tak ada filter dipilih -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    variant="primary"
    title="Hitung Ulang Seluruh Saldo?"
    message="Anda tidak memilih filter apa pun. Proses akan menghitung ulang SELURUH saldo cuti karyawan. Lanjutkan?"
    confirm-text="Ya, Hitung Ulang Semua"
    :loading="loading"
    @confirm="runRecalculate"
  />
</template>
