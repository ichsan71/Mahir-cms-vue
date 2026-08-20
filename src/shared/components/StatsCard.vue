<script setup>
// Port dari resources/views/components/stats-card.blade.php
import { UsersIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/vue/24/outline";

defineProps({
  value: { type: [String, Number], default: "0" },
  label: { type: String, default: "" },
  // Komponen ikon Heroicon (mis. UsersIcon).
  icon: { type: [Object, Function], default: null },
  color: { type: String, default: "#243B8F" },
  bgColor: { type: String, default: "#E7EEFF" },
  delta: { type: String, default: null },
  deltaDir: { type: String, default: "up" }, // 'up' | 'down' | 'flat'
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
      <component :is="icon || UsersIcon" class="h-5 w-5" />
    </div>
    <div class="min-w-0">
      <div class="text-2xl font-bold leading-tight text-slate-900">{{ value }}</div>
      <div class="text-[13px] text-mahir-muted">{{ label }}</div>
      <div
        v-if="delta"
        class="mt-1 flex items-center gap-0.5 text-xs"
        :class="{
          'font-semibold text-mahir-success': deltaDir === 'up',
          'font-semibold text-mahir-danger': deltaDir === 'down',
          'font-medium text-slate-400': deltaDir === 'flat',
        }"
      >
        <component
          v-if="deltaDir !== 'flat'"
          :is="deltaDir === 'up' ? ArrowUpIcon : ArrowDownIcon"
          class="h-3.5 w-3.5"
        />
        {{ delta }}
      </div>
    </div>
  </div>
</template>
