<script setup>
// Tab "Riwayat Gaji" pada Detail Karyawan. Read-only: menampilkan daftar gaji
// milik karyawan yang dibaca langsung dari field ber-paginasi
// `getEmployee.salaries(params)` (bukan listEmployeeSalary). Paginasi mandiri
// lewat query terpisah agar tidak memuat ulang seluruh objek karyawan.
import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_EMPLOYEE_SALARIES } from "../graphql/salary.queries";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { formatDate } from "@/shared/utils/format";
import { BanknotesIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — gajinya diambil via getEmployee.salaries.
  employee: { type: Object, default: null },
});

// Periode pembayaran — sekadar pelabelan UI (String bebas di backend).
const PAY_PERIOD_LABELS = {
  MONTHLY: "Bulanan",
  WEEKLY: "Mingguan",
  DAILY: "Harian",
};

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

const page = ref(1);
const pageSize = ref(10);

watch(employeeId, () => {
  page.value = 1;
});

const { result, loading } = useQuery(
  GET_EMPLOYEE_SALARIES,
  () => ({
    getEmployeeId: employeeId.value,
    params: {
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const paginate = computed(() => result.value?.getEmployee?.data?.salaries ?? null);
const salaries = computed(() => paginate.value?.results ?? []);
const pagination = computed(() => {
  const count = paginate.value?.count ?? 0;
  const size = pageSize.value || 10;
  return {
    count,
    currentPage: paginate.value?.currentPage ?? page.value,
    totalPages: paginate.value?.totalPages ?? Math.max(1, Math.ceil(count / size)),
    hasNext: paginate.value?.hasNext ?? false,
    hasPrev: paginate.value?.hasPrev ?? false,
  };
});

function nextPage() {
  if (pagination.value.hasNext) page.value += 1;
}
function prevPage() {
  if (pagination.value.hasPrev) page.value -= 1;
}

// Format angka dengan pemisah ribuan + kode mata uang (default IDR).
function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
  return `${currency || "IDR"} ${num}`;
}

// Estimasi total komponen utk satu struktur gaji (penjumlahan semua nilai).
function componentsTotal(components) {
  return (components ?? []).reduce((sum, c) => {
    const n = Number(c.value);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);
}

function payPeriodLabel(value) {
  if (!value) return "-";
  return PAY_PERIOD_LABELS[value] ?? value;
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <BanknotesIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Gaji</h2>
          <p class="text-[11.5px] text-slate-400">{{ pagination.count }} data gaji</p>
        </div>
      </div>
    </div>

    <div class="p-5">
      <!-- Loading -->
      <div v-if="loading && !salaries.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat riwayat gaji…
      </div>

      <!-- Kosong -->
      <div v-else-if="!salaries.length" class="py-12 text-center text-sm text-slate-400">
        Belum ada data gaji untuk karyawan ini.
      </div>

      <!-- Daftar gaji -->
      <div v-else class="space-y-4">
        <div v-for="s in salaries" :key="s.id" class="rounded-xl border border-mahir-border">
          <!-- Ringkasan -->
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-mahir-border/70 px-4 py-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">Berlaku {{ formatDate(s.effectiveDate) }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="s.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
                >
                  {{ s.isActive ? "Aktif" : "Nonaktif" }}
                </span>
              </div>
              <div class="mt-0.5 text-[12px] text-slate-400">
                {{ payPeriodLabel(s.payPeriod) }} · {{ s.currency || "IDR" }}
                <template v-if="s.paymentMethod"> · {{ s.paymentMethod }}</template>
              </div>
            </div>
            <div class="text-right">
              <div class="text-[11px] uppercase tracking-wide text-slate-400">Take Home</div>
              <div class="text-sm font-bold text-slate-800">{{ money(s.takeHome, s.currency) }}</div>
            </div>
          </div>

          <!-- Komponen -->
          <div class="px-4 py-3">
            <div v-if="!s.components?.length" class="text-[13px] text-slate-400">Tidak ada komponen.</div>
            <table v-else class="w-full text-sm">
              <tbody>
                <tr
                  v-for="c in s.components"
                  :key="c.id"
                  class="border-b border-mahir-border/50 last:border-0"
                >
                  <td class="py-2 pr-3">
                    <span class="font-medium text-slate-700">{{ c.componentType?.name ?? "-" }}</span>
                    <span class="ml-1 text-[12px] text-slate-400">{{ c.componentType?.code }}</span>
                  </td>
                  <td class="py-2 pr-3">
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                      :class="categoryBadgeClass(c.componentType?.category)"
                    >
                      {{ categoryLabel(c.componentType?.category) }}
                    </span>
                  </td>
                  <td class="py-2 text-right font-semibold text-slate-800">
                    {{ money(c.value, s.currency) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-mahir-border">
                  <td class="py-2 pr-3 text-[13px] font-medium text-slate-500" colspan="2">
                    Estimasi total
                  </td>
                  <td class="py-2 text-right font-bold text-mahir-primary">
                    {{ money(componentsTotal(s.components), s.currency) }}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p v-if="s.notes" class="mt-2 text-[12px] text-slate-500">{{ s.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer / paginasi -->
    <div
      v-if="salaries.length"
      class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
    >
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ salaries.length }} dari {{ pagination.count }} data gaji</span
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
</template>
