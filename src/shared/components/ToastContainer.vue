<script setup>
// Kontainer notifikasi toast global, dirender sekali di App.vue.
import { storeToRefs } from "pinia";
import { useToastStore } from "@/stores/toast.store";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/solid";

const toast = useToastStore();
const { toasts } = storeToRefs(toast);

const variants = {
  success: { icon: CheckCircleIcon, classes: "border-mahir-success/30 bg-white text-mahir-success" },
  error: { icon: ExclamationCircleIcon, classes: "border-mahir-danger/30 bg-white text-mahir-danger" },
  warning: { icon: ExclamationTriangleIcon, classes: "border-amber-300 bg-white text-amber-600" },
  info: { icon: InformationCircleIcon, classes: "border-mahir-primary/30 bg-white text-mahir-primary" },
};
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[2000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg"
        :class="(variants[t.type] || variants.info).classes"
        role="alert"
      >
        <component :is="(variants[t.type] || variants.info).icon" class="mt-px h-5 w-5 shrink-0" />
        <span class="flex-1 text-slate-700">{{ t.message }}</span>
        <button
          class="text-slate-400 hover:text-slate-600"
          aria-label="Tutup notifikasi"
          @click="toast.remove(t.id)"
        >
          <XMarkIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
