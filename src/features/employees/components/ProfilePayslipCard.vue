<script setup>
// Slip Gaji pada "Profil Saya". Sensitif → di balik GERBANG PASSWORD: data tidak
// di-fetch & tidak tampil sampai user memasukkan password-nya (re-auth lewat
// mutation login). Begitu lolos, query GET_MY_PAYSLIPS (getEmployee.payslips
// nested) dijalankan dan hanya slip berstatus FINAL yang ditampilkan.
//
// Label bulan memakai bulan `periodEnd` (konvensi "gaji bulan X"); rentang
// tanggal & tanggal terbit (emittedAt) ikut ditampilkan agar tak ambigu.
import { computed, ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { GET_MY_PAYSLIPS } from "../graphql/payslip.queries";
import { LOGIN } from "@/features/auth/graphql/auth.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { formatDate } from "@/shared/utils/format";
import { BanknotesIcon, ArrowPathIcon, LockClosedIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  employeeId: { type: [Number, String], default: null },
});

const auth = useAuthStore();

// ── Gerbang password (re-auth) ───────────────────────────────────────────────
const unlocked = ref(false);
const password = ref("");
const verifying = ref(false);
const errorMsg = ref("");

const { mutate: loginMut } = useMutation(LOGIN);

function cleanMsg(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

async function unlock() {
  errorMsg.value = "";
  if (!password.value) {
    errorMsg.value = "Masukkan password Anda.";
    return;
  }
  const username = auth.user?.username;
  if (!username) {
    errorMsg.value = "Sesi tidak valid. Silakan login ulang.";
    return;
  }
  verifying.value = true;
  try {
    const res = await loginMut({
      input: { username, password: password.value, platform: "EMPLOYEE" },
    });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    const payload = res?.data?.login?.data;
    if (!payload?.token || !payload?.user) throw new Error("Password salah.");
    // Adopsi sesi dengan token baru yang valid → sesi tidak terganggu meski
    // backend memutar token lama.
    auth.setSession(payload);
    unlocked.value = true;
    password.value = "";
  } catch (e) {
    errorMsg.value = cleanMsg(e) || "Password salah.";
  } finally {
    verifying.value = false;
  }
}

// ── Data slip (hanya setelah unlocked) ───────────────────────────────────────
const employeeIdNum = computed(() => {
  const n = Number(props.employeeId);
  return Number.isInteger(n) && n > 0 ? n : null;
});

const { result, loading } = useQuery(
  GET_MY_PAYSLIPS,
  () => ({ getEmployeeId: employeeIdNum.value, params: { page: 1, pageSize: 200 } }),
  () => ({ enabled: unlocked.value && !!employeeIdNum.value, fetchPolicy: "cache-and-network" }),
);

const allSlips = computed(() => result.value?.getEmployee?.data?.payslips?.results ?? []);
// Hanya slip FINAL (PayslipParams tak punya filter status → saring di klien),
// urut periode terbaru dulu.
const slips = computed(() =>
  [...allSlips.value]
    .filter((s) => s.status === "FINAL")
    .sort((a, b) => String(b.periodEnd).localeCompare(String(a.periodEnd))),
);

// ── Filter periode (berdasarkan periodEnd) ───────────────────────────────────
const selectedPeriod = ref(""); // "" = semua periode
// Opsi diambil dari slip yang ada (bukan hardcode): distinct periodEnd.
const periodOptions = computed(() => {
  const seen = new Map();
  for (const s of slips.value) {
    if (s.periodEnd && !seen.has(s.periodEnd)) {
      seen.set(s.periodEnd, monthLabel(s.periodEnd));
    }
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }));
});
const filteredSlips = computed(() =>
  selectedPeriod.value
    ? slips.value.filter((s) => s.periodEnd === selectedPeriod.value)
    : slips.value,
);

// ── Util tampilan ────────────────────────────────────────────────────────────
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
// Label bulan dari periodEnd ("2026-10-20" → "Oktober 2026").
function monthLabel(dateStr) {
  const m = String(dateStr || "").match(/^(\d{4})-(\d{2})/);
  if (!m) return "-";
  return `${MONTHS_ID[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}
function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  // Tampilkan nilai rupiah bulat (tanpa sen/desimal).
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
  return `${currency || "IDR"} ${num}`;
}
function dateOnly(v) {
  return v ? formatDate(String(v).slice(0, 10)) : "-";
}

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

// Penjumlahan aman untuk array nilai string Decimal.
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
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <BanknotesIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Slip Gaji</h2>
        <p class="text-[11.5px] text-slate-400">
          <template v-if="unlocked">{{ slips.length }} slip final</template>
          <template v-else>Terkunci — butuh password</template>
        </p>
      </div>
    </div>

    <!-- Gerbang password -->
    <div v-if="!unlocked" class="p-5">
      <div class="mx-auto max-w-sm rounded-xl border border-mahir-border bg-slate-50/60 p-6 text-center">
        <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-mahir-primary shadow-sm">
          <LockClosedIcon class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-semibold text-slate-800">Slip gaji terkunci</h3>
        <p class="mt-1 text-[13px] text-slate-500">
          Masukkan password akun Anda untuk melihat slip gaji.
        </p>

        <form class="mt-4 space-y-3 text-left" @submit.prevent="unlock">
          <div>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Password"
              class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
              :disabled="verifying"
            />
            <p v-if="errorMsg" class="mt-1.5 text-[12px] text-red-500">{{ errorMsg }}</p>
          </div>
          <button
            type="submit"
            :disabled="verifying"
            class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowPathIcon v-if="verifying" class="h-4 w-4 animate-spin" />
            {{ verifying ? "Memverifikasi…" : "Buka Slip Gaji" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Konten slip (setelah unlocked) -->
    <div v-else class="p-5">
      <div v-if="loading && !slips.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat slip gaji…
      </div>

      <div v-else-if="!slips.length" class="py-10 text-center text-sm text-slate-400">
        Belum ada slip gaji final untuk Anda.
      </div>

      <template v-else>
        <!-- Filter periode -->
        <div class="mb-4 flex items-center gap-2">
          <label class="text-[13px] font-medium text-slate-500">Periode</label>
          <select
            v-model="selectedPeriod"
            class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          >
            <option value="">Semua Periode</option>
            <option v-for="p in periodOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>

        <div v-if="!filteredSlips.length" class="py-10 text-center text-sm text-slate-400">
          Tidak ada slip gaji untuk periode ini.
        </div>

        <div v-else class="space-y-6">
          <div v-for="s in filteredSlips" :key="s.id" class="overflow-hidden rounded-xl border border-mahir-border">
          <!-- Header slip -->
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-mahir-border bg-slate-50/60 px-4 py-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">Slip Gaji {{ monthLabel(s.periodEnd) }}</span>
                <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Final</span>
              </div>
              <div class="mt-0.5 text-[12px] text-slate-500">
                Periode {{ dateOnly(s.periodStart) }} – {{ dateOnly(s.periodEnd) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-[11px] uppercase tracking-wide text-slate-400">Gaji Bersih</div>
              <div class="text-lg font-bold text-mahir-primary">{{ money(s.netPay, s.currency) }}</div>
            </div>
          </div>

          <!-- Meta -->
          <dl class="grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-mahir-border/70 px-4 py-3 text-[12px] sm:grid-cols-4">
            <div>
              <dt class="text-slate-400">Mata Uang</dt>
              <dd class="font-medium text-slate-700">{{ s.currency || "IDR" }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Status</dt>
              <dd class="font-medium text-slate-700">{{ s.status }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Diterbitkan</dt>
              <dd class="font-medium text-slate-700">{{ dateOnly(s.emittedAt) }}</dd>
            </div>
            <div>
              <dt class="text-slate-400">Difinalisasi</dt>
              <dd class="font-medium text-slate-700">{{ dateOnly(s.finalizedAt) }}</dd>
            </div>
          </dl>

          <!-- Pendapatan (komponen) -->
          <div v-if="s.breakdown?.components?.length" class="px-4 py-3">
            <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Pendapatan</div>
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="(c, i) in s.breakdown.components"
                  :key="i"
                  class="border-b border-mahir-border/50"
                >
                  <td class="py-2 pr-3">
                    <span class="font-medium text-slate-700">{{ c.code }}</span>
                    <span v-if="c.prorated" class="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">prorata</span>
                  </td>
                  <td class="py-2 pr-3">
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                      :class="categoryBadgeClass(c.category)"
                    >
                      {{ categoryLabel(c.category) }}
                    </span>
                  </td>
                  <td class="py-2 text-right font-semibold text-slate-800">{{ money(c.value, s.currency) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600" colspan="2">Bruto</td>
                  <td class="py-2 text-right font-bold text-slate-800">{{ money(s.gross, s.currency) }}</td>
                </tr>
              </tfoot>
            </table>
            <p
              v-if="s.breakdown.proration_factor && Number(s.breakdown.proration_factor) !== 1"
              class="mt-1 text-[12px] text-amber-600"
            >
              Faktor prorata diterapkan: {{ s.breakdown.proration_factor }}
            </p>
          </div>

          <!-- Rincian Potongan (dari deduction) -->
          <div v-if="s.deduction?.breakdown?.length" class="border-t border-mahir-border/70 px-4 py-3">
            <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Rincian Potongan</div>
            <div class="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
              <span>Hari kerja: <span class="font-medium text-slate-700">{{ s.deduction.totalWorkDay }}</span></span>
              <span>Absen: <span class="font-medium text-slate-700">{{ s.deduction.absentDays }}</span></span>
              <span>Cuti tak dibayar: <span class="font-medium text-slate-700">{{ s.deduction.unpaidLeaveDays }}</span></span>
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
                  <tr v-for="(d, i) in s.deduction.breakdown" :key="i" class="border-b border-mahir-border/50">
                    <td class="py-2 pr-3 whitespace-nowrap">
                      <span class="font-medium text-slate-700">{{ d.code }}</span>
                      <span
                        class="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        :class="categoryBadgeClass(d.category)"
                      >
                        {{ categoryLabel(d.category) }}
                      </span>
                    </td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ money(d.monthlyValue, s.currency) }}</td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ money(d.dailyRate, s.currency) }}</td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ d.unpaidDays }}</td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ d.lateForfeitDays }}</td>
                    <td class="py-2 pr-3 text-right font-medium text-slate-700">{{ d.daysDeducted }}</td>
                    <td class="py-2 text-right font-semibold text-red-500">− {{ money(d.amount, s.currency) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t border-mahir-border">
                    <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600" colspan="6">Total Potongan</td>
                    <td class="py-2 text-right font-bold text-red-500">− {{ money(s.deduction.totalDeduction, s.currency) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Rincian BPJS -->
          <div v-if="bpjsRows(s.breakdown).length" class="border-t border-mahir-border/70 px-4 py-3">
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
                  <tr
                    v-for="r in bpjsRows(s.breakdown)"
                    :key="r.key"
                    class="border-b border-mahir-border/50"
                  >
                    <td class="py-2 pr-3 font-medium text-slate-700">{{ r.label }}</td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ money(r.base, s.currency) }}</td>
                    <td class="py-2 pr-3 text-right text-slate-600">{{ money(r.employee, s.currency) }}</td>
                    <td class="py-2 text-right text-slate-600">{{ money(r.employer, s.currency) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t border-mahir-border">
                    <td class="py-2 pr-3 text-[13px] font-semibold text-slate-600">Total</td>
                    <td class="py-2 pr-3"></td>
                    <td class="py-2 pr-3 text-right font-bold text-slate-800">{{ money(bpjsTotal(s.breakdown, 'employee'), s.currency) }}</td>
                    <td class="py-2 text-right font-bold text-slate-800">{{ money(bpjsTotal(s.breakdown, 'employer'), s.currency) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Perhitungan gaji bersih -->
          <div class="border-t border-mahir-border bg-slate-50/60 px-4 py-3">
            <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">Perhitungan Gaji Bersih</div>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Bruto</dt>
                <dd class="font-medium text-slate-700">{{ money(s.gross, s.currency) }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">Total Potongan</dt>
                <dd class="font-medium text-red-500">− {{ money(s.totalDeduction, s.currency) }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">BPJS (karyawan)</dt>
                <dd class="font-medium text-red-500">− {{ money(s.bpjsEmployee, s.currency) }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-slate-500">PPh 21</dt>
                <dd class="font-medium text-red-500">− {{ money(s.pph21, s.currency) }}</dd>
              </div>
              <div v-if="Number(s.adjustment) !== 0 || s.adjustmentNote" class="flex justify-between gap-3">
                <dt class="text-slate-500">
                  Penyesuaian
                  <span v-if="s.adjustmentNote" class="text-[12px] text-slate-400">({{ s.adjustmentNote }})</span>
                </dt>
                <dd class="font-medium text-slate-700">{{ money(s.adjustment, s.currency) }}</dd>
              </div>
              <div class="flex justify-between gap-3 border-t border-mahir-border pt-2">
                <dt class="font-semibold text-slate-800">Gaji Bersih</dt>
                <dd class="text-base font-bold text-mahir-primary">{{ money(s.netPay, s.currency) }}</dd>
              </div>
            </dl>
            <p class="mt-2 text-[11px] text-slate-400">
              Kontribusi BPJS perusahaan sebesar {{ money(s.bpjsEmployer, s.currency) }} tidak memotong gaji Anda.
            </p>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>
