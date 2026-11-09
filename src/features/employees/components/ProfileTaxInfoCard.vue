<script setup>
// Pajak pada "Profil Saya". Read-only; data one-to-one dari field nested
// `getEmployee.taxInfo` (ikut di GET_MY_PROFILE core fields).
import { computed } from "vue";
import { formatDate } from "@/shared/utils/format";
import { DocumentTextIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  taxInfo: { type: Object, default: null },
});

const hasTax = computed(() => !!props.taxInfo?.id);

// Metode perhitungan pajak umum — `taxMethod` di backend String bebas.
const TAX_METHODS = {
  GROSS: "Gross (pajak ditanggung karyawan)",
  GROSS_UP: "Gross Up (tunjangan pajak)",
  NETT: "Nett (pajak ditanggung perusahaan)",
};
function taxMethodLabel(value) {
  if (!value) return "-";
  return TAX_METHODS[value] ?? value;
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <DocumentTextIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Info Pajak</h2>
        <p class="text-[11.5px] text-slate-400">NPWP &amp; status PTKP</p>
      </div>
    </div>

    <div class="p-5">
      <div v-if="!hasTax" class="py-10 text-center text-sm text-slate-400">
        Belum ada info pajak untuk Anda.
      </div>

      <dl v-else class="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
          <dt class="text-slate-400">NPWP</dt>
          <dd class="font-medium text-slate-700">
            {{ taxInfo.npwp || "-" }}
            <span
              v-if="taxInfo.npwp"
              class="ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              :class="taxInfo.isNpwpActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
            >
              {{ taxInfo.isNpwpActive ? "Aktif" : "Nonaktif" }}
            </span>
          </dd>
        </div>
        <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
          <dt class="text-slate-400">Tgl Terdaftar NPWP</dt>
          <dd class="font-medium text-slate-700">{{ taxInfo.npwpRegisteredDate ? formatDate(taxInfo.npwpRegisteredDate) : "-" }}</dd>
        </div>
        <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
          <dt class="text-slate-400">Status PTKP</dt>
          <dd class="font-medium text-slate-700">{{ taxInfo.ptkpStatus || "-" }}</dd>
        </div>
        <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
          <dt class="text-slate-400">Tanggungan</dt>
          <dd class="font-medium text-slate-700">{{ taxInfo.ptkpDependents ?? "-" }}</dd>
        </div>
        <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2 sm:col-span-2">
          <dt class="text-slate-400">Metode Pajak</dt>
          <dd class="font-medium text-slate-700">{{ taxMethodLabel(taxInfo.taxMethod) }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>
