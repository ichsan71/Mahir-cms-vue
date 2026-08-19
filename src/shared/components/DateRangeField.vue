<script setup>
// Pemilih rentang tanggal (dari–sampai) memakai dua input date native yang
// saling terkait: tanggal "Dari" membatasi minimum "Sampai" dan sebaliknya,
// sehingga rentang selalu valid. v-model:from & v-model:to (string "YYYY-MM-DD").
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";

defineProps({
  from: { type: String, default: "" },
  to: { type: String, default: "" },
  // Batas atas keseluruhan (mis. hari ini) — opsional.
  max: { type: String, default: "" },
});

const emit = defineEmits(["update:from", "update:to"]);

const fieldCls =
  "w-full rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <CalendarDaysIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        :value="from"
        type="date"
        :max="to || max || undefined"
        :class="fieldCls"
        @input="emit('update:from', $event.target.value)"
      />
    </div>
    <span class="shrink-0 text-sm text-mahir-muted">s/d</span>
    <div class="relative flex-1">
      <CalendarDaysIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        :value="to"
        type="date"
        :min="from || undefined"
        :max="max || undefined"
        :class="fieldCls"
        @input="emit('update:to', $event.target.value)"
      />
    </div>
  </div>
</template>
