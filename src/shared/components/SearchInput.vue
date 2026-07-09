<script setup>
// Input pencarian dengan ikon. Dipakai v-model dari toolbar tiap fitur.
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Cari..." },
  width: { type: String, default: "200px" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="relative" :style="{ width }">
    <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
