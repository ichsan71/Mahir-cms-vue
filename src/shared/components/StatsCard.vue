<script setup>
// Port dari resources/views/components/stats-card.blade.php
defineProps({
  value: { type: [String, Number], default: "0" },
  label: { type: String, default: "" },
  icon: { type: String, default: "bi-people-fill" },
  color: { type: String, default: "#243B8F" },
  bgColor: { type: String, default: "#E7EEFF" },
  delta: { type: String, default: null },
  deltaDir: { type: String, default: "up" }, // 'up' | 'down'
});
</script>

<template>
  <div
    class="flex h-full items-start gap-3 rounded-2xl border border-mahir-border bg-white p-5 shadow-sm"
  >
    <div
      class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg"
      :style="{ background: bgColor, color }"
    >
      <i class="bi" :class="icon"></i>
    </div>
    <div class="min-w-0">
      <div class="text-2xl font-bold leading-tight text-slate-900">{{ value }}</div>
      <div class="text-[13px] text-mahir-muted">{{ label }}</div>
      <div
        v-if="delta"
        class="mt-1 flex items-center gap-0.5 text-xs font-semibold"
        :class="deltaDir === 'up' ? 'text-mahir-success' : 'text-mahir-danger'"
      >
        <i class="bi" :class="deltaDir === 'up' ? 'bi-arrow-up-short' : 'bi-arrow-down-short'"></i>
        {{ delta }}
      </div>
    </div>
  </div>
</template>
