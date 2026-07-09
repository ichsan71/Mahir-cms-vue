<script setup>
// Dialog konfirmasi generik (mis. sebelum hapus data).
// v-model:open mengontrol visibilitas; emit "confirm" saat pengguna menyetujui.
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Konfirmasi" },
  message: { type: String, default: "Apakah Anda yakin?" },
  confirmText: { type: String, default: "Ya, Lanjutkan" },
  cancelText: { type: String, default: "Batal" },
  loading: { type: Boolean, default: false },
  // Gaya tombol konfirmasi: "danger" (hapus) | "primary".
  variant: { type: String, default: "danger" },
});

const emit = defineEmits(["update:open", "confirm"]);

function close() {
  emit("update:open", false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[1060] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
          <div class="px-6 pb-2 pt-6 text-center">
            <div
              class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              :class="variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-mahir-primary-soft text-mahir-primary'"
            >
              <component :is="variant === 'danger' ? ExclamationTriangleIcon : QuestionMarkCircleIcon" class="h-6 w-6" />
            </div>
            <h5 class="text-lg font-bold text-slate-900">{{ title }}</h5>
            <p class="mt-1.5 text-sm text-slate-500">{{ message }}</p>
          </div>

          <div class="flex justify-center gap-2 px-6 py-5">
            <button
              type="button"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              :disabled="loading"
              @click="close"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              :class="variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-mahir-primary hover:bg-mahir-primary/90'"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <ArrowPathIcon v-if="loading" class="mr-1 inline h-4 w-4 animate-spin" />
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
