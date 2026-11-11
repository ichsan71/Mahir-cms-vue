<script setup>
// Modal "Penyesuaian Slip" — nominal adjustment (boleh negatif) + catatan.
// Dipakai selagi slip masih draft (sebelum diajukan).
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { formatDate } from "@/shared/utils/format";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  payslip: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "submit"]);

const adjustment = ref("");
const adjustmentNote = ref("");

watch(
  () => props.open,
  (open) => {
    if (open) {
      // Prefill dari nilai yang tersimpan (bila ada).
      adjustment.value = props.payslip?.adjustment ?? "";
      adjustmentNote.value = props.payslip?.adjustmentNote ?? "";
    }
  },
);

function onSubmit() {
  if (adjustment.value === "" || adjustment.value === null) return;
  emit("submit", {
    id: props.payslip?.id,
    adjustment: Number(adjustment.value),
    adjustmentNote: adjustmentNote.value.trim() || null,
  });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Penyesuaian Slip Gaji"
    size="md"
    :loading="saving"
    submit-text="Simpan Penyesuaian"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div v-if="payslip" class="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
        <span class="font-semibold text-slate-800">{{ payslip.employee?.fullName ?? "-" }}</span>
        — periode {{ formatDate(payslip.periodStart) }} s/d {{ formatDate(payslip.periodEnd) }}
      </div>
      <div>
        <label :class="labelCls">Nominal Penyesuaian *</label>
        <input
          v-model="adjustment"
          type="number"
          step="any"
          required
          :class="fieldCls"
          placeholder="mis. 50000 atau -25000"
        />
        <p class="mt-1 text-[12px] text-mahir-muted">
          Nilai positif menambah, negatif mengurangi gaji bersih (net pay).
        </p>
      </div>
      <div>
        <label :class="labelCls">Catatan</label>
        <textarea
          v-model="adjustmentNote"
          rows="3"
          :class="fieldCls"
          placeholder="Alasan penyesuaian (opsional)"
        />
      </div>
    </div>
  </BaseModal>
</template>
