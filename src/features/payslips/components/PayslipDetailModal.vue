<script setup>
// Modal detail slip gaji (sisi admin) — layout kaya seperti kartu "Slip Gaji" di
// Profil Saya: Pendapatan (komponen), Rincian Potongan (dari deduction), Rincian
// BPJS, dan Perhitungan Gaji Bersih. Ditambah jejak persetujuan.
// Mengambil data lengkap via getPayslip saat dibuka.
import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import BaseModal from "@/shared/components/BaseModal.vue";
import { GET_PAYSLIP } from "../graphql/payslip.queries";
import { statusMeta } from "../constants";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { formatDate } from "@/shared/utils/format";

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
const approvals = computed(() => p.value?.approvals?.results ?? []);

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

// ── BPJS dari breakdown.bpjs ────────────────────────────────────────────────
const BPJS_LABELS = {
  jp: "JP (Jaminan Pensiun)",
  jht: "JHT (Jaminan Hari Tua)",
  jkk: "JKK (Kecelakaan Kerja)",
  jkm: "JKM (Kematian)",
  kesehatan: "Kesehatan",
};
function bpjsRows(breakdown) {
  const b = breakdown?.bpjs ?? {};
  return Object.keys(BPJS_LABELS)
    .filter((k) => b[k])
    .map((k) => ({ key: k, label: BPJS_LABELS[k], ...b[k] }));
}
function sumBy(arr, key) {
  return (arr ?? []).reduce((acc, x) => {
    const n = Number(x?.[key]);
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);
}
function bpjsTotal(breakdown, which) {
  return sumBy(bpjsRows(breakdown), which);
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

      <!-- Pendapatan (komponen) -->
      <div v-if="p.breakdown?.components?.length" class="rounded-xl border border-mahir-border px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Pendapatan</div>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="(c, i) in p.breakdown.components" :key="i" class="border-b border-mahir-border/50">
              <td class="py-2 pr-3">
                <span class="font-medium text-slate-700">{{ c.code }}</span>
                <span v-if="c.prorated" class="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">prorata</span>
              </td>
              <td class="py-2 pr-3">
                <span class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="categoryBadgeClass(c.category)">
                  {{ categoryLabel(c.category) }}
                </span>
              </td>
              <td class="py-2 text-right font-semibold text-slate-800">{{ money(c.value, p.currency) }}</td>
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
          v-if="p.breakdown.proration_factor && Number(p.breakdown.proration_factor) !== 1"
          class="mt-1 text-[12px] text-amber-600"
        >
          Faktor prorata diterapkan: {{ p.breakdown.proration_factor }}
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

      <!-- Rincian BPJS -->
      <div v-if="bpjsRows(p.breakdown).length" class="rounded-xl border border-mahir-border px-4 py-3">
        <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Rincian BPJS</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-mahir-border text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th class="py-2 pr-3 font-semibold">Jenis</th>
                <th class="py-2 pr-3 font-semibold text-right">Dasar</th>
                <th class="py-2 pr-3 font-semibold text-right">Karyawan</th>
                <th class="py-2 font-semibold text-right">Perusahaan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in bpjsRows(p.breakdown)" :key="r.key" class="border-b border-mahir-border/50">
                <td class="py-2 pr-3 font-medium text-slate-700">{{ r.label }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(r.base, p.currency) }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(r.employee, p.currency) }}</td>
                <td class="py-2 text-right text-slate-600">{{ money(r.employer, p.currency) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-mahir-border">
                <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600">Total</td>
                <td class="py-2 pr-3"></td>
                <td class="py-2 pr-3 text-right font-bold text-slate-800">{{ money(bpjsTotal(p.breakdown, 'employee'), p.currency) }}</td>
                <td class="py-2 text-right font-bold text-slate-800">{{ money(bpjsTotal(p.breakdown, 'employer'), p.currency) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
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
          <div v-if="Number(p.adjustment) !== 0 || p.adjustmentNote" class="flex justify-between gap-3">
            <dt class="text-slate-500">
              Penyesuaian
              <span v-if="p.adjustmentNote" class="text-[12px] text-slate-400">({{ p.adjustmentNote }})</span>
            </dt>
            <dd class="font-medium text-slate-700">{{ money(p.adjustment, p.currency) }}</dd>
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
      <div v-if="approvals.length">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Jejak Persetujuan</h3>
        <ol class="space-y-2">
          <li
            v-for="a in approvals"
            :key="a.id"
            class="flex items-start justify-between gap-3 rounded-lg border border-mahir-border px-3 py-2"
          >
            <div>
              <div class="text-[13px] font-medium text-slate-700">
                {{ a.order != null ? `#${a.order} ` : "" }}{{ a.approver?.fullName ?? "-" }}
              </div>
              <div v-if="a.remark" class="text-[12px] text-slate-500">{{ a.remark }}</div>
              <div v-if="a.actedAt" class="text-[11px] text-slate-400">{{ dateOnly(a.actedAt) }}</div>
            </div>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="statusMeta(a.status).cls">
              {{ statusMeta(a.status).label }}
            </span>
          </li>
        </ol>
      </div>
    </div>

    <div v-else class="py-10 text-center text-slate-400">Data slip tidak ditemukan.</div>
  </BaseModal>
</template>
