<script setup>
defineProps({
  items: { type: Array, default: () => [] }, // [{ id, text, time, color }]
});
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.id" class="flex gap-3">
      <span
        class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
        :style="{ background: item.color }"
      ></span>
      <div>
        <div class="text-[13px] text-slate-800">{{ item.text }}</div>
        <div class="text-xs text-slate-400">{{ item.time }}</div>
      </div>
    </div>
  </div>
</template>
