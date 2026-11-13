<script setup>
// Stepper persetujuan slip gaji — menandai langkah yang sedang ditunggu.
// mode penuh (detail) = daftar vertikal; `compact` (list) = titik + ringkasan.
import { computed } from "vue";
import { buildApprovalSteps } from "../constants";
import { formatDate } from "@/shared/utils/format";
import { CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  approvals: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
});

const steps = computed(() => buildApprovalSteps(props.approvals));
const currentName = computed(() => steps.value.find((s) => s.state === "current")?.approver?.fullName ?? null);
const rejected = computed(() => steps.value.some((s) => s.state === "rejected"));
const allDone = computed(() => steps.value.length > 0 && steps.value.every((s) => s.state === "done"));

// Ringkasan untuk mode compact.
const summary = computed(() => {
  if (rejected.value) return { text: "Ditolak", cls: "text-mahir-danger" };
  if (allDone.value) return { text: "Disetujui", cls: "text-mahir-success" };
  if (currentName.value) return { text: `Menunggu ${currentName.value}`, cls: "text-mahir-warning" };
  return { text: "Menunggu persetujuan", cls: "text-mahir-warning" };
});

function dotClass(state) {
  return {
    done: "bg-mahir-success",
    current: "bg-mahir-warning ring-2 ring-mahir-warning/30",
    rejected: "bg-mahir-danger",
    upcoming: "bg-slate-300",
  }[state];
}
function nodeClass(state) {
  return {
    done: "bg-mahir-success text-white",
    current: "bg-mahir-warning text-white ring-4 ring-mahir-warning/20",
    rejected: "bg-mahir-danger text-white",
    upcoming: "bg-slate-200 text-slate-400",
  }[state];
}
function dateOnly(v) {
  return v ? formatDate(String(v).slice(0, 10)) : null;
}
</script>

<template>
  <!-- Compact (list): titik + teks ringkas -->
  <div v-if="compact" class="flex items-center justify-center gap-1.5">
    <span class="flex items-center gap-1">
      <span
        v-for="(s, i) in steps"
        :key="s.id ?? i"
        class="h-2 w-2 rounded-full"
        :class="dotClass(s.state)"
      />
    </span>
    <span class="text-[11px] font-medium" :class="summary.cls">{{ summary.text }}</span>
  </div>

  <!-- Penuh (detail): stepper vertikal -->
  <ol v-else class="relative">
    <li v-for="(s, i) in steps" :key="s.id ?? i" class="relative flex gap-3 pb-5 last:pb-0">
      <!-- garis konektor -->
      <span
        v-if="i < steps.length - 1"
        class="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px"
        :class="s.state === 'done' ? 'bg-mahir-success/40' : 'bg-slate-200'"
      />
      <!-- node -->
      <span
        class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
        :class="nodeClass(s.state)"
      >
        <CheckIcon v-if="s.state === 'done'" class="h-4 w-4" />
        <XMarkIcon v-else-if="s.state === 'rejected'" class="h-4 w-4" />
        <ClockIcon v-else-if="s.state === 'current'" class="h-4 w-4" />
        <span v-else>{{ s.order ?? i + 1 }}</span>
      </span>
      <!-- isi -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] font-medium text-slate-800">{{ s.approver?.fullName ?? "-" }}</span>
          <span
            v-if="s.state === 'current'"
            class="rounded-full bg-mahir-warning-soft px-2 py-0.5 text-[10px] font-semibold text-mahir-warning"
          >
            Menunggu persetujuan
          </span>
          <span
            v-else-if="s.state === 'done'"
            class="rounded-full bg-mahir-success-soft px-2 py-0.5 text-[10px] font-semibold text-mahir-success"
          >
            Disetujui
          </span>
          <span
            v-else-if="s.state === 'rejected'"
            class="rounded-full bg-mahir-danger-soft px-2 py-0.5 text-[10px] font-semibold text-mahir-danger"
          >
            Ditolak
          </span>
          <span v-else class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            Menunggu giliran
          </span>
        </div>
        <div v-if="s.remark" class="mt-0.5 text-[12px] text-slate-500">{{ s.remark }}</div>
        <div v-if="dateOnly(s.actedAt)" class="mt-0.5 text-[11px] text-slate-400">{{ dateOnly(s.actedAt) }}</div>
      </div>
    </li>
  </ol>
</template>
