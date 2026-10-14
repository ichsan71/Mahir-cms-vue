<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { formatDate } from "@/shared/utils/format";
import { prettyEnum } from "@/shared/composables/useEnumChoices";
import { useChangelogDetail } from "../composables/useChangelogDetail";
import { XMarkIcon, PaperClipIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  // Id changelog yang ditampilkan (null saat modal tertutup).
  id: { type: [Number, String], default: null },
});
const emit = defineEmits(["update:open"]);

// Query hanya jalan saat id valid (mis. modal terbuka).
const idRef = computed(() => (props.open ? props.id : null));
const { changelog, loading } = useChangelogDetail(idRef);

function close() {
  emit("update:open", false);
}
function pretty(v) {
  return v ? prettyEnum(v) : "—";
}
// Nama berkas dari URL lampiran.
function fileName(url) {
  if (!url) return "Lampiran";
  try {
    return decodeURIComponent(url.split("/").pop().split("?")[0]) || "Lampiran";
  } catch {
    return "Lampiran";
  }
}

function onKeydown(e) {
  if (e.key === "Escape") close();
}
onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div class="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 border-b border-mahir-border px-6 py-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-if="changelog?.version"
                  class="inline-flex items-center rounded bg-mahir-primary-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-primary"
                >
                  v{{ changelog.version }}
                </span>
                <span class="text-[12px] text-slate-400">{{ pretty(changelog?.appName) }}</span>
              </div>
              <h5 class="mt-1.5 text-lg font-bold text-slate-900">
                {{ changelog?.title || (loading ? "Memuat…" : "—") }}
              </h5>
            </div>
            <button
              type="button"
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto px-6 py-5">
            <div v-if="loading && !changelog" class="py-10 text-center text-sm text-slate-400">
              Memuat data…
            </div>

            <template v-else-if="changelog">
              <!-- Metadata ringkas -->
              <div class="mb-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tipe</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ pretty(changelog.changeType) }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Platform</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ pretty(changelog.platform) }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Versi Min.</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ changelog.minVersion || "—" }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Penulis</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ changelog.authorName || "—" }}</p>
                </div>
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tanggal</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ formatDate(changelog.createdAt) }}</p>
                </div>
                <div v-if="changelog.reference">
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Referensi</span>
                  <p class="mt-0.5 font-medium text-slate-800">{{ changelog.reference }}</p>
                </div>
              </div>

              <!-- Deskripsi -->
              <div class="mb-4">
                <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Deskripsi</span>
                <p
                  v-if="changelog.description"
                  class="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-slate-700"
                >
                  {{ changelog.description }}
                </p>
                <p v-else class="mt-1.5 text-[13px] text-slate-400">Tidak ada deskripsi.</p>
              </div>

              <!-- Lampiran -->
              <div v-if="changelog.attachments?.length">
                <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Lampiran</span>
                <ul class="mt-1.5 flex flex-col gap-2">
                  <li v-for="(att, idx) in changelog.attachments" :key="att.id ?? idx">
                    <a
                      :href="att.file"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-2 rounded-lg border border-mahir-border px-3 py-2 text-[13px] text-mahir-primary hover:bg-slate-50"
                    >
                      <PaperClipIcon class="h-4 w-4 flex-shrink-0" />
                      <span class="truncate">{{ att.caption || fileName(att.file) }}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </template>
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
