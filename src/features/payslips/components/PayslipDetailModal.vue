<script setup>
// Modal detail slip gaji (sisi admin) — layout kaya seperti kartu "Slip Gaji" di
// Profil Saya: Pendapatan (komponen), Rincian Potongan (dari deduction), Rincian
// BPJS, dan Perhitungan Gaji Bersih. Ditambah jejak persetujuan.
// Mengambil data lengkap via getPayslip saat dibuka.
import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import BaseModal from "@/shared/components/BaseModal.vue";
import ApprovalStepper from "./ApprovalStepper.vue";
import { GET_PAYSLIP } from "../graphql/payslip.queries";
import { statusMeta } from "../constants";
import { usePayslipPrint } from "../composables/usePayslipPrint";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { formatDate } from "@/shared/utils/format";
import { PrinterIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  payslipId: { type: Number, default: null },
});

const emit = defineEmits(["update:open"]);

// Fetch detail hanya saat modal terbuka & ada id.
const enabled = computed(() => props.open && !!props.payslipId);
const { result, loading } = useQuery(
  GET_PAYSLIP,
  () => ({ id: props.payslipId }),
  () => ({ enabled: enabled.value, fetchPolicy: "cache-and-network" }),
);

const p = computed(() => result.value?.getPayslip?.data ?? null);
const badge = computed(() => statusMeta(p.value?.status));

const { print, printing } = usePayslipPrint();
function onPrint() {
  if (p.value) print(p.value);
}
const approvals = computed(() => p.value?.approvals?.results ?? []);

// Line-item slip dikelompokkan oleh `kind` (enum EmployeePayslipItemKindChoices:
// EARNING / DEDUCTION / BPJS_EMPLOYEE / BPJS_EMPLOYER / TAX / ADJUSTMENT). Urut
// berdasar `order`. Pendapatan = EARNING; penyesuaian net = ADJUSTMENT. Potongan,
// BPJS, dan pajak tampil dari section/scalar tersendiri.
const items = computed(() =>
  [...(p.value?.items ?? [])].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999)),
);
const earningItems = computed(() => items.value.filter((i) => i.kind === "EARNING"));
const adjustmentItems = computed(() => items.value.filter((i) => i.kind === "ADJUSTMENT"));
const adjustmentTotal = computed(() =>
  adjustmentItems.value.reduce((s, i) => s + (Number(i.amount) || 0), 0),
);
// Keterangan ringkas untuk baris Penyesuaian di ringkasan: hanya bila tepat 1
// item (kalau banyak, rinciannya ada di section Penyesuaian di atas).
const adjustmentNote = computed(() => {
  const list = adjustmentItems.value;
  return list.length === 1 ? list[0].note || list[0].code || null : null;
});

// Gabungkan nama unit (relasi many) menjadi satu teks.
function unitNames(emp) {
  return (emp?.units ?? []).map((u) => u.name).join(", ") || "—";
}

function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(n));
  return `${currency || "IDR"} ${num}`;
}
function dateOnly(v) {
  return v ? formatDate(String(v).slice(0, 10)) : "-";
}
// Nominal bertanda (+/−) untuk item penyesuaian manual.
function signed(v, currency) {
  const n = Number(v) || 0;
  return `${n < 0 ? "− " : "+ "}${money(Math.abs(n), currency)}`;
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Detail Slip Gaji"
    size="xl"
    submit-text="Tutup"
    @update:open="emit('update:open', $event)"
    @submit="emit('update:open', false)"
  >
    <div v-if="loading && !p" class="py-10 text-center text-slate-400">Memuat data…</div>

    <div v-else-if="p" class="space-y-5">
      <!-- Aksi cetak -->
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-mahir-primary hover:text-mahir-primary disabled:opacity-50"
          :disabled="printing"
          @click="onPrint"
        >
          <PrinterIcon class="h-4 w-4" /> Cetak / Unduh PDF
        </button>
      </div>

      <!-- Header slip -->
      <div class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-mahir-border bg-slate-50/60 px-4 py-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-semibold text-slate-800">{{ p.employee?.fullName ?? "-" }}</span>
            <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="badge.cls">
              {{ badge.label }}
            </span>
          </div>
          <div class="mt-0.5 text-[12px] text-slate-500">{{ unitNames(p.employee) }} · {{ p.employee?.level?.name ?? "—" }}</div>
          <div class="mt-0.5 text-[12px] text-slate-500">
            Periode {{ dateOnly(p.periodStart) }} – {{ dateOnly(p.periodEnd) }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Gaji Bersih</div>
          <div class="text-lg font-bold text-mahir-primary">{{ money(p.netPay, p.currency) }}</div>
        </div>
      </div>

      <!-- Meta -->
      <dl class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] sm:grid-cols-4">
        <div>
          <dt class="text-slate-400">Mata Uang</dt>
          <dd class="font-medium text-slate-700">{{ p.currency || "IDR" }}</dd>
        </div>
        <div>
          <dt class="text-slate-400">Status</dt>
          <dd class="font-medium text-slate-700">{{ badge.label }}</dd>
        </div>
        <div>
          <dt class="text-slate-400">Diterbitkan</dt>
          <dd class="font-medium text-slate-700">{{ dateOnly(p.emittedAt) }}</dd>
        </div>
        <div>
          <dt class="text-slate-400">Difinalisasi</dt>
          <dd class="font-medium text-slate-700">{{ dateOnly(p.finalizedAt) }}</dd>
        </div>
      </dl>

      <!-- Pendapatan (komponen otomatis) -->
      <div v-if="earningItems.length" class="rounded-xl border border-mahir-border px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Pendapatan</div>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="c in earningItems" :key="c.id" class="border-b border-mahir-border/50">
              <td class="py-2 pr-3">
                <span class="font-medium text-slate-700">{{ c.note || c.code }}</span>
                <span v-if="c.prorated" class="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">prorata</span>
              </td>
              <td class="py-2 pr-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="categoryBadgeClass(c.category)">
                  {{ categoryLabel(c.category) }}
                </span>
              </td>
              <td class="py-2 text-right font-semibold text-slate-800">{{ money(c.amount, p.currency) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600" colspan="2">Bruto</td>
              <td class="py-2 text-right font-bold text-slate-800">{{ money(p.gross, p.currency) }}</td>
            </tr>
          </tfoot>
        </table>
        <p
          v-if="p.prorationFactor && Number(p.prorationFactor) !== 1"
          class="mt-1 text-[12px] text-amber-600"
        >
          Faktor prorata diterapkan: {{ p.prorationFactor }}
        </p>
      </div>

      <!-- Rincian Potongan (dari deduction) -->
      <div v-if="p.deduction?.breakdown?.length" class="rounded-xl border border-mahir-border px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Rincian Potongan</div>
        <div class="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
          <span>Hari kerja: <span class="font-medium text-slate-700">{{ p.deduction.totalWorkDay }}</span></span>
          <span>Absen: <span class="font-medium text-slate-700">{{ p.deduction.absentDays }}</span></span>
          <span>Cuti tak dibayar: <span class="font-medium text-slate-700">{{ p.deduction.unpaidLeaveDays }}</span></span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-mahir-border text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th class="py-2 pr-3 font-semibold">Komponen</th>
                <th class="py-2 pr-3 font-semibold text-right">Nilai/Bln</th>
                <th class="py-2 pr-3 font-semibold text-right">Tarif/Hari</th>
                <th class="py-2 pr-3 font-semibold text-right" title="Hari tidak dibayar">Tdk Dibayar</th>
                <th class="py-2 pr-3 font-semibold text-right" title="Hari hangus karena keterlambatan">Hangus</th>
                <th class="py-2 pr-3 font-semibold text-right">Hari Dipotong</th>
                <th class="py-2 font-semibold text-right">Potongan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in p.deduction.breakdown" :key="i" class="border-b border-mahir-border/50">
                <td class="py-2 pr-3 whitespace-nowrap">
                  <span class="font-medium text-slate-700">{{ d.code }}</span>
                  <span class="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium" :class="categoryBadgeClass(d.category)">
                    {{ categoryLabel(d.category) }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(d.monthlyValue, p.currency) }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(d.dailyRate, p.currency) }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ d.unpaidDays }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ d.lateForfeitDays }}</td>
                <td class="py-2 pr-3 text-right font-medium text-slate-700">{{ d.daysDeducted }}</td>
                <td class="py-2 text-right font-semibold text-red-500">− {{ money(d.amount, p.currency) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-mahir-border">
                <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600" colspan="6">Total Potongan</td>
                <td class="py-2 text-right font-bold text-red-500">− {{ money(p.deduction.totalDeduction, p.currency) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Penyesuaian (kind = ADJUSTMENT) -->
      <div v-if="adjustmentItems.length" class="rounded-xl border border-mahir-border px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Penyesuaian</div>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="it in adjustmentItems" :key="it.id" class="border-b border-mahir-border/50">
              <td class="py-2 pr-3 text-slate-700">{{ it.note || it.code || "—" }}</td>
              <td class="py-2 text-right font-semibold" :class="Number(it.amount) < 0 ? 'text-red-500' : 'text-emerald-600'">
                {{ signed(it.amount, p.currency) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600">Total Penyesuaian</td>
              <td class="py-2 text-right font-bold" :class="adjustmentTotal < 0 ? 'text-red-500' : 'text-emerald-600'">
                {{ signed(adjustmentTotal, p.currency) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Perhitungan gaji bersih -->
      <div class="rounded-xl border border-mahir-border bg-slate-50/60 px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Perhitungan Gaji Bersih</div>
        <dl class="space-y-1.5 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Bruto</dt>
            <dd class="font-medium text-slate-700">{{ money(p.gross, p.currency) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Total Potongan</dt>
            <dd class="font-medium text-red-500">− {{ money(p.totalDeduction, p.currency) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">BPJS (karyawan)</dt>
            <dd class="font-medium text-red-500">− {{ money(p.bpjsEmployee, p.currency) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">PPh 21</dt>
            <dd class="font-medium text-red-500">− {{ money(p.pph21, p.currency) }}</dd>
          </div>
          <div v-if="adjustmentTotal !== 0" class="flex justify-between gap-3">
            <dt class="text-slate-500">
              Penyesuaian
              <span v-if="adjustmentNote" class="text-[12px] text-slate-400">({{ adjustmentNote }})</span>
            </dt>
            <dd class="font-medium" :class="adjustmentTotal < 0 ? 'text-red-500' : 'text-emerald-600'">
              {{ signed(adjustmentTotal, p.currency) }}
            </dd>
          </div>
          <div class="flex justify-between gap-3 border-t border-mahir-border pt-2">
            <dt class="font-semibold text-slate-800">Gaji Bersih</dt>
            <dd class="text-base font-bold text-mahir-primary">{{ money(p.netPay, p.currency) }}</dd>
          </div>
        </dl>
        <p class="mt-2 text-[11px] text-slate-400">
          Kontribusi BPJS perusahaan sebesar {{ money(p.bpjsEmployer, p.currency) }} tidak memotong gaji karyawan.
        </p>
      </div>

      <!-- Jejak persetujuan -->
      <div v-if="approvals.length" class="rounded-xl border border-mahir-border px-4 py-3">
        <h3 class="mb-3 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">
          Jejak Persetujuan
        </h3>
        <ApprovalStepper :approvals="approvals" />
      </div>
    </div>

    <div v-else class="py-10 text-center text-slate-400">Data slip tidak ditemukan.</div>
  </BaseModal>
</template>
