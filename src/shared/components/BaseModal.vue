<script setup>
// Pengganti components/modal-form.blade.php — tanpa bootstrap JS.
// Memakai Teleport + transition. v-model:open mengontrol visibilitas.
import { XMarkIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Form" },
  size: { type: String, default: "lg" }, // 'md' | 'lg' | 'xl'
  // Saat true: tombol simpan jadi spinner "Memuat…" & dinonaktifkan,
  // dan modal tidak bisa ditutup agar proses tidak terputus.
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: "Simpan" },
});

const emit = defineEmits(["update:open", "submit"]);

const SIZE = { md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };

function close() {
  if (props.loading) return;
  emit("update:open", false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div
          class="w-full overflow-hidden rounded-2xl bg-white shadow-xl"
          :class="SIZE[size] || SIZE.lg"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-mahir-border px-6 py-4">
            <h5 class="text-lg font-bold text-slate-900">{{ title }}</h5>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              :disabled="loading"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="emit('submit')">
            <div class="max-h-[70vh] overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 border-t border-mahir-border px-6 py-4">
              <button
                type="button"
                class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                :disabled="loading"
                @click="close"
              >
                Batal
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
              >
                <ArrowPathIcon v-if="loading" class="h-4 w-4 animate-spin" />
                {{ loading ? "Memuat…" : submitText }}
              </button>
            </div>
          </form>
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
