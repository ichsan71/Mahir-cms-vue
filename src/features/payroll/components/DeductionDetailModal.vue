<script setup>
// Modal detail potongan: ringkasan periode + rincian per komponen (breakdown).
import { computed } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { formatDate } from "@/shared/utils/format";

const props = defineProps({
  open: { type: Boolean, default: false },
  deduction: { type: Object, default: null },
});

const emit = defineEmits(["update:open"]);

const d = computed(() => props.deduction);

function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
  return `${currency || "IDR"} ${num}`;
}
</script>

<template>
  <BaseModal
    :open="open"
    title="Detail Potongan Gaji"
    size="xl"
    submit-text="Tutup"
    @update:open="emit('update:open', $event)"
    @submit="emit('update:open', false)"
  >
    <div v-if="d" class="space-y-5">
      <!-- Ringkasan -->
      <div>
        <div class="flex items-center gap-2">
          <span class="text-base font-semibold text-slate-800">{{ d.employee?.fullName ?? "-" }}</span>
          <span
            class="rounded-full px-2 py-0.5 text-[11px] font-medium"
            :class="d.isFinal ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
          >
            {{ d.isFinal ? "Final" : "Draft" }}
          </span>
        </div>
        <div class="mt-0.5 text-[13px] text-slate-500">
          Periode {{ formatDate(d.periodStart) }} – {{ formatDate(d.periodEnd) }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-lg border border-mahir-border p-3">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Hari Kerja</div>
          <div class="text-sm font-semibold text-slate-800">{{ d.totalWorkDay ?? "-" }}</div>
        </div>
        <div class="rounded-lg border border-mahir-border p-3">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Absen</div>
          <div class="text-sm font-semibold text-slate-800">{{ d.absentDays ?? "-" }}</div>
        </div>
        <div class="rounded-lg border border-mahir-border p-3">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Cuti Tak Berbayar</div>
          <div class="text-sm font-semibold text-slate-800">{{ d.unpaidLeaveDays ?? "-" }}</div>
        </div>
        <div class="rounded-lg border border-mahir-border p-3">
          <div class="text-[11px] uppercase tracking-wide text-slate-400">Total Potongan</div>
          <div class="text-sm font-bold text-mahir-danger">{{ money(d.totalDeduction, d.currency) }}</div>
        </div>
      </div>

      <!-- Breakdown -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Rincian per Komponen</h3>
        <div v-if="!d.breakdown?.length" class="rounded-lg border border-dashed border-mahir-border py-6 text-center text-[13px] text-slate-400">
          Tidak ada rincian potongan.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-mahir-border text-[11px] uppercase tracking-wide text-slate-400">
                <th class="py-2 pr-3 font-semibold">Komponen</th>
                <th class="py-2 pr-3 font-semibold">Kategori</th>
                <th class="py-2 pr-3 text-right font-semibold">Nilai/Bulan</th>
                <th class="py-2 pr-3 text-right font-semibold">Tarif/Hari</th>
                <th class="py-2 pr-3 text-right font-semibold">Hari Dipotong</th>
                <th class="py-2 text-right font-semibold">Potongan</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(b, i) in d.breakdown"
                :key="i"
                class="border-b border-mahir-border/50 last:border-0"
              >
                <td class="py-2 pr-3 font-medium text-slate-700">{{ b.code ?? "-" }}</td>
                <td class="py-2 pr-3">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :class="categoryBadgeClass(b.category)"
                  >
                    {{ categoryLabel(b.category) }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(b.monthlyValue, d.currency) }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">{{ money(b.dailyRate, d.currency) }}</td>
                <td class="py-2 pr-3 text-right text-slate-600">
                  {{ b.daysDeducted ?? 0 }}
                  <span v-if="b.lateForfeitDays" class="text-[11px] text-slate-400">(+{{ b.lateForfeitDays }} telat)</span>
                </td>
                <td class="py-2 text-right font-semibold text-mahir-danger">{{ money(b.amount, d.currency) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
