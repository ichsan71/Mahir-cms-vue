<script setup>
// Tab "Slip Gaji" — daftar slip gaji dengan aksi siklus hidup:
// buat (generate → draft) → penyesuaian (adjust) → ajukan (submit) → ekspor.
// Semua aksi di-gate permission (UX saja; API tetap menegakkan).
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePayslips } from "../composables/usePayslips";
import { usePayslipActions } from "../composables/usePayslipActions";
import { usePayslipExport } from "../composables/usePayslipExport";
import { usePayslipPrint } from "../composables/usePayslipPrint";
import { usePayslipFiltersStore } from "../stores/payslipFilters.store";
import { statusMeta, isDraft, isSubmittable, PAGE_SIZES } from "../constants";
import { PERM } from "../permissions";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEmployeeSearch } from "@/features/employees/composables/useEmployeeSearch";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import GeneratePayslipModal from "../components/GeneratePayslipModal.vue";
import AdjustPayslipModal from "../components/AdjustPayslipModal.vue";
import PayslipDetailModal from "../components/PayslipDetailModal.vue";
import PayslipExportModal from "../components/PayslipExportModal.vue";
import ApprovalStepper from "../components/ApprovalStepper.vue";
import { formatDate } from "@/shared/utils/format";
import {
  EyeIcon,
  PencilSquareIcon,
  PaperAirplaneIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
} from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const filters = usePayslipFiltersStore();
const { employeeIds: filterEmployeeIds } = storeToRefs(filters);

const { payslips, pagination, loading, refetch, nextPage, prevPage, currentFilters } = usePayslips();
const { generate, submit, loading: acting } = usePayslipActions();
const { exportPayslip, loading: exporting } = usePayslipExport();
const { printById, printing } = usePayslipPrint();

// Filter karyawan (multi).
const {
  options: employeeOptions,
  loading: employeeLoading,
  setSearch: setEmployeeSearch,
} = useEmployeeSearch();
const employeeSelected = ref([]);

function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(n));
  return `${currency || "IDR"} ${num}`;
}

// Gabungkan nama unit (relasi many) menjadi satu teks.
function unitNames(emp) {
  return (emp?.units ?? []).map((u) => u.name).join(", ") || "—";
}

// ── Seleksi untuk pengajuan massal ──────────────────────────────────────────
const selected = ref(new Set());
function toggle(id) {
  const s = new Set(selected.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selected.value = s;
}
const allSelected = computed(
  () => payslips.value.length > 0 && payslips.value.every((p) => selected.value.has(p.id)),
);
function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set();
  } else {
    selected.value = new Set(payslips.value.map((p) => p.id));
  }
}
const selectedCount = computed(() => selected.value.size);

// ── Buat slip ────────────────────────────────────────────────────────────────
const generateOpen = ref(false);
async function handleGenerate(payload) {
  const res = await generate(payload);
  if (res) {
    generateOpen.value = false;
    refetch();
  }
}

// ── Penyesuaian (kelola item slip) ───────────────────────────────────────────
const adjustOpen = ref(false);
const adjustTarget = ref(null);
function openAdjust(row) {
  adjustTarget.value = row;
  adjustOpen.value = true;
}

// ── Detail ───────────────────────────────────────────────────────────────────
const detailOpen = ref(false);
const detailId = ref(null);
function openDetail(row) {
  detailId.value = row.id;
  detailOpen.value = true;
}

// ── Ekspor ───────────────────────────────────────────────────────────────────
const exportOpen = ref(false);
async function handleExport({ email, format }) {
  // Ikuti filter daftar yang sedang aktif.
  const res = await exportPayslip({ email, format, filters: currentFilters() });
  if (res) exportOpen.value = false;
}

// ── Konfirmasi pengajuan ─────────────────────────────────────────────────────
const confirmOpen = ref(false);
const confirmKind = ref("submit"); // "submit" | "submitBulk"
const confirmTarget = ref(null);

const confirmMeta = computed(() => {
  const name = confirmTarget.value?.employee?.fullName ?? "";
  if (confirmKind.value === "submitBulk") {
    return {
      title: "Ajukan Slip Terpilih",
      message: `Ajukan ${selectedCount.value} slip gaji terpilih untuk persetujuan?`,
      confirm: "Ya, Ajukan",
    };
  }
  return {
    title: "Ajukan Slip",
    message: `Ajukan slip gaji ${name ? `"${name}"` : "ini"} untuk persetujuan?`,
    confirm: "Ya, Ajukan",
  };
});

function openSubmit(row) {
  confirmKind.value = "submit";
  confirmTarget.value = row;
  confirmOpen.value = true;
}
function openSubmitBulk() {
  confirmKind.value = "submitBulk";
  confirmTarget.value = null;
  confirmOpen.value = true;
}

async function handleConfirm() {
  let ok = false;
  if (confirmKind.value === "submit") {
    ok = !!(await submit({ ids: [confirmTarget.value?.id] }));
  } else if (confirmKind.value === "submitBulk") {
    ok = !!(await submit({ ids: [...selected.value] }));
    if (ok) selected.value = new Set();
  }
  if (ok) {
    confirmOpen.value = false;
    confirmTarget.value = null;
    refetch();
  }
}

const fieldCls =
  "rounded-lg border border-mahir-border py-2 px-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const canSelect = computed(() => auth.can(PERM.SUBMIT));
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Slip Gaji
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <div class="min-w-[220px]">
          <SearchableSelect
            v-model="filterEmployeeIds"
            :selected="employeeSelected"
            :options="employeeOptions"
            :loading="employeeLoading"
            multiple
            floating
            placeholder="Semua karyawan"
            search-placeholder="Cari karyawan…"
            @search="setEmployeeSearch"
          />
        </div>
        <label class="flex items-center gap-1.5 text-[13px] text-slate-500">
          Periode
          <input v-model="filters.periodEndFrom" type="date" :class="fieldCls" title="Periode berakhir dari" />
          –
          <input v-model="filters.periodEndTo" type="date" :class="fieldCls" title="Periode berakhir sampai" />
        </label>

        <button
          v-if="auth.can(PERM.EXPORT)"
          class="flex items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          @click="exportOpen = true"
        >
          <ArrowDownTrayIcon class="h-4 w-4" /> Ekspor
        </button>
        <button
          v-if="auth.can(PERM.GENERATE)"
          class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
          @click="generateOpen = true"
        >
          <PlusIcon class="h-4 w-4" /> Buat Slip
        </button>
      </div>
    </div>

    <!-- Bar aksi massal -->
    <div
      v-if="canSelect && selectedCount"
      class="flex items-center justify-between gap-3 border-y border-mahir-border bg-mahir-primary/5 px-5 py-2.5"
    >
      <span class="text-[13px] font-medium text-slate-700">{{ selectedCount }} slip terpilih</span>
      <button
        class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-mahir-primary/90"
        @click="openSubmitBulk"
      >
        <PaperAirplaneIcon class="h-4 w-4" /> Ajukan Terpilih
      </button>
    </div>

    <!-- Bar: jumlah per halaman + info jumlah data -->
    <div class="flex items-center gap-3 border-t border-mahir-border px-5 py-2.5">
      <label class="flex items-center gap-1.5 text-[13px] text-mahir-muted">
        Tampilkan
        <select v-model.number="filters.pageSize" :class="fieldCls" class="!py-1">
          <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ payslips.length }} dari {{ pagination.count }} slip</span
      >
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th v-if="canSelect" class="px-4 py-3">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            </th>
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Unit</th>
            <th class="px-4 py-3 font-semibold">Level</th>
            <th class="px-4 py-3 font-semibold">Periode</th>
            <th class="px-4 py-3 text-right font-semibold">Gaji Kotor</th>
            <th class="px-4 py-3 text-right font-semibold">Potongan</th>
            <th class="px-4 py-3 text-right font-semibold">Gaji Bersih</th>
            <th class="px-4 py-3 text-center font-semibold">Status</th>
            <th class="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !payslips.length">
            <td :colspan="canSelect ? 10 : 9" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
          </tr>
          <tr v-else-if="!payslips.length">
            <td :colspan="canSelect ? 10 : 9" class="px-4 py-8 text-center text-slate-400">Belum ada slip gaji.</td>
          </tr>
          <tr
            v-for="row in payslips"
            :key="row.id"
            class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
          >
            <td v-if="canSelect" class="px-4 py-3">
              <input type="checkbox" :checked="selected.has(row.id)" @change="toggle(row.id)" />
            </td>
            <td class="px-4 py-3 font-semibold text-slate-800">{{ row.employee?.fullName ?? "-" }}</td>
            <td class="px-4 py-3 text-slate-600">{{ unitNames(row.employee) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.employee?.level?.name ?? "—" }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{ formatDate(row.periodStart) }} – {{ formatDate(row.periodEnd) }}
            </td>
            <td class="px-4 py-3 text-right text-slate-600">{{ money(row.gross, row.currency) }}</td>
            <td class="px-4 py-3 text-right text-mahir-danger">{{ money(row.totalDeduction, row.currency) }}</td>
            <td class="px-4 py-3 text-right font-bold text-slate-800">{{ money(row.netPay, row.currency) }}</td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                :class="statusMeta(row.status).cls"
              >
                {{ statusMeta(row.status).label }}
              </span>
              <ApprovalStepper
                v-if="row.approvals?.results?.length"
                :approvals="row.approvals.results"
                compact
                class="mt-1.5"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  v-if="auth.can(PERM.GET)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Detail"
                  @click="openDetail(row)"
                >
                  <EyeIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="auth.can(PERM.GET)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  title="Cetak / Unduh slip"
                  :disabled="printing"
                  @click="printById(row.id)"
                >
                  <PrinterIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="(auth.can(PERM.ITEM_CREATE) || auth.can(PERM.ITEM_EDIT) || auth.can(PERM.ITEM_DELETE)) && isDraft(row.status)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
                  title="Penyesuaian"
                  @click="openAdjust(row)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="auth.can(PERM.SUBMIT) && isSubmittable(row.status)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-primary/10 text-mahir-primary hover:bg-mahir-primary/20"
                  title="Ajukan untuk persetujuan"
                  @click="openSubmit(row)"
                >
                  <PaperAirplaneIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / pagination -->
    <div class="flex items-center justify-end border-t border-mahir-border px-5 py-3">
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

  <!-- Modals -->
  <GeneratePayslipModal v-model:open="generateOpen" :saving="acting" @submit="handleGenerate" />
  <AdjustPayslipModal v-model:open="adjustOpen" :payslip="adjustTarget" @changed="refetch" />
  <PayslipDetailModal v-model:open="detailOpen" :payslip-id="detailId" />
  <PayslipExportModal v-model:open="exportOpen" :saving="exporting" @submit="handleExport" />

  <ConfirmDialog
    v-model:open="confirmOpen"
    :title="confirmMeta.title"
    :message="confirmMeta.message"
    :confirm-text="confirmMeta.confirm"
    variant="primary"
    :loading="acting"
    @confirm="handleConfirm"
  />
</template>
