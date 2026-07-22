<script setup>
// Lightbox sederhana untuk melihat gambar ukuran penuh.
// v-model:open mengontrol visibilitas. Tutup via backdrop, tombol X, atau Esc.
import { watch, onBeforeUnmount } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
});

const emit = defineEmits(["update:open"]);

function close() {
  emit("update:open", false);
}

function onKey(e) {
  if (e.key === "Escape") close();
}

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener("keydown", onKey);
    else window.removeEventListener("keydown", onKey);
  },
);

onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open && src"
        class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/80 p-4"
        @click.self="close"
      >
        <button
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          title="Tutup"
          @click="close"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>

        <figure class="flex max-h-full max-w-full flex-col items-center gap-3">
          <img
            :src="src"
            :alt="alt"
            class="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
          <figcaption v-if="alt" class="text-sm font-medium text-white/80">{{ alt }}</figcaption>
        </figure>
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
