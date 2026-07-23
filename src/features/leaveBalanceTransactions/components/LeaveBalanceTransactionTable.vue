<script setup>
import { prettyEnum } from "@/shared/composables/useEnumChoices";
import { ArrowUpRightIcon, ArrowDownRightIcon } from "@heroicons/vue/24/outline";

defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

function num(v) {
  return v === null || v === undefined ? "—" : v;
}
function delta(row) {
  return Number(row?.after ?? 0) - Number(row?.before ?? 0);
}
function isCredit(row) {
  return delta(row) >= 0;
}
function signedAmount(row) {
  const mag = Math.abs(Number(row?.amount ?? delta(row)));
  return `${isCredit(row) ? "+" : "−"}${mag}`;
}
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !transactions.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!transactions.length" class="py-10 text-center text-sm text-slate-400">
      Tidak ada mutasi yang cocok.
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="row in transactions"
        :key="row.id"
        class="flex items-center gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Node arah -->
        <span
          class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          :class="isCredit(row) ? 'bg-mahir-success-soft text-mahir-success' : 'bg-mahir-danger-soft text-mahir-danger'"
        >
          <ArrowUpRightIcon v-if="isCredit(row)" class="h-5 w-5" />
          <ArrowDownRightIcon v-else class="h-5 w-5" />
        </span>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[13.5px] font-semibold text-slate-800">
              {{ row.balance?.leaveType?.name || row.leave?.leaveType?.name || "—" }}
            </span>
            <span v-if="row.balance?.year" class="text-[12px] text-slate-400">Tahun {{ row.balance.year }}</span>
            <span
              class="rounded-md border border-mahir-border bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-slate-500"
            >
              {{ prettyEnum(row.transactionType) || "—" }}
            </span>
          </div>
          <p class="mt-0.5 line-clamp-1 text-[13px] text-slate-500">{{ row.description || "—" }}</p>
        </div>

        <!-- Nilai -->
        <div class="flex-shrink-0 text-right">
          <div
            class="text-base font-bold"
            :class="isCredit(row) ? 'text-mahir-success' : 'text-mahir-danger'"
          >
            {{ signedAmount(row) }}
          </div>
          <div class="font-mono text-[11px] text-slate-400">{{ num(row.before) }} → {{ num(row.after) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
