<script setup>
// Halaman Penggajian — daftar potongan gaji (hasil kalkulasi kehadiran) dengan
// aksi "Hitung Potongan" per karyawan/periode dan detail rincian per komponen.
import { ref, watch, onUnmounted } from "vue";
import { useSalaryDeductions } from "../composables/useSalaryDeductions";
import { useComputeDeduction } from "../composables/useComputeDeduction";
import { useDeductionFiltersStore } from "../stores/deductionFilters.store";
import ComputeDeductionModal from "../components/ComputeDeductionModal.vue";
import DeductionDetailModal from "../components/DeductionDetailModal.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import { MagnifyingGlassIcon, EyeIcon, CalculatorIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const filters = useDeductionFiltersStore();

const { deductions, pagination, loading, refetch, nextPage, prevPage } = useSalaryDeductions();
const { compute, loading: computing } = useComputeDeduction();

// Search dengan debounce → commit ke store.
const localSearch = ref(filters.search);
let timeoutId = null;
watch(localSearch, () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    filters.search = localSearch.value;
  }, 400);
});
onUnmounted(() => clearTimeout(timeoutId));

function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
  return `${currency || "IDR"} ${num}`;
}

// ── Hitung potongan ───────────────────────────────────────────────────────────
const computeOpen = ref(false);

async function handleCompute({ employeeId, periodMonth }) {
  const res = await compute(employeeId, periodMonth);
  if (res) {
    computeOpen.value = false;
    refetch();
  }
}

// ── Detail ────────────────────────────────────────────────────────────────────
const detailOpen = ref(false);
const detailTarget = ref(null);

function openDetail(row) {
  detailTarget.value = row;
  detailOpen.value = true;
}

const fieldCls =
  "rounded-lg border border-mahir-border py-2 px-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Penggajian</h1>
      <p class="text-sm text-mahir-muted">Potongan gaji hasil kalkulasi kehadiran & cuti karyawan</p>
    </div>
    <button
      v-if="auth.can(PERM.COMPUTE)"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
      @click="computeOpen = true"
    >
      <CalculatorIcon class="h-4 w-4" /> Hitung Potongan
    </button>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Potongan
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input v-model="localSearch" type="text" placeholder="Cari karyawan..." :class="[fieldCls, 'w-[200px] pl-9']" />
        </div>
        <select v-model="filters.isFinal" :class="fieldCls">
          <option value="">Semua Status</option>
          <option value="true">Final</option>
          <option value="false">Draft</option>
        </select>
        <label class="flex items-center gap-1.5 text-[13px] text-slate-500">
          Periode
          <input v-model="filters.periodEndFrom" type="date" :class="fieldCls" title="Periode berakhir dari" />
          –
          <input v-model="filters.periodEndTo" type="date" :class="fieldCls" title="Periode berakhir sampai" />
        </label>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Periode</th>
            <th class="px-4 py-3 text-right font-semibold">Hari Kerja</th>
            <th class="px-4 py-3 text-right font-semibold">Absen</th>
            <th class="px-4 py-3 text-right font-semibold">Cuti Tak Berbayar</th>
            <th class="px-4 py-3 text-right font-semibold">Total Potongan</th>
            <th class="px-4 py-3 text-center font-semibold">Status</th>
            <th class="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !deductions.length">
            <td colspan="8" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
          </tr>
          <tr v-else-if="!deductions.length">
            <td colspan="8" class="px-4 py-8 text-center text-slate-400">Belum ada potongan gaji.</td>
          </tr>
          <tr
            v-for="row in deductions"
            :key="row.id"
            class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
          >
            <td class="px-4 py-3 font-semibold text-slate-800">{{ row.employee?.fullName ?? "-" }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{ formatDate(row.periodStart) }} – {{ formatDate(row.periodEnd) }}
            </td>
            <td class="px-4 py-3 text-right text-slate-600">{{ row.totalWorkDay ?? "-" }}</td>
            <td class="px-4 py-3 text-right text-slate-600">{{ row.absentDays ?? "-" }}</td>
            <td class="px-4 py-3 text-right text-slate-600">{{ row.unpaidLeaveDays ?? "-" }}</td>
            <td class="px-4 py-3 text-right font-bold text-mahir-danger">
              {{ money(row.totalDeduction, row.currency) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                :class="row.isFinal ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
              >
                {{ row.isFinal ? "Final" : "Draft" }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Detail"
                  @click="openDetail(row)"
                >
                  <EyeIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ deductions.length }} dari {{ pagination.count }} potongan</span
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

  <!-- Modal hitung potongan -->
  <ComputeDeductionModal
    v-model:open="computeOpen"
    :saving="computing"
    @submit="handleCompute"
  />

  <!-- Modal detail potongan -->
  <DeductionDetailModal v-model:open="detailOpen" :deduction="detailTarget" />
</template>
