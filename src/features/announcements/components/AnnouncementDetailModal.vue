<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate } from "@/shared/utils/format";
import { useAnnouncementDetail } from "../composables/useAnnouncementDetail";
import {
  XMarkIcon,
  BookmarkIcon,
  PaperClipIcon,
  CalendarDaysIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  // Id pengumuman yang ditampilkan (null saat modal tertutup).
  id: { type: [Number, String], default: null },
});
const emit = defineEmits(["update:open"]);

// Query hanya jalan saat id valid (mis. modal terbuka).
const idRef = computed(() => (props.open ? props.id : null));
const { announcement, loading } = useAnnouncementDetail(idRef);

function close() {
  emit("update:open", false);
}
function badgeKey(s) {
  return String(s ?? "").toLowerCase();
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
                  v-if="announcement?.isPinned"
                  class="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700"
                >
                  <BookmarkIcon class="h-3 w-3" /> Pin
                </span>
                <StatusBadge v-if="announcement?.status" :status="badgeKey(announcement.status)" />
              </div>
              <h5 class="mt-1.5 text-lg font-bold text-slate-900">
                {{ announcement?.title || (loading ? "Memuat…" : "—") }}
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
            <div v-if="loading && !announcement" class="py-10 text-center text-sm text-slate-400">
              Memuat data…
            </div>

            <template v-else-if="announcement">
              <!-- Jadwal -->
              <div class="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                <div class="inline-flex items-center gap-1.5 text-slate-600">
                  <CalendarDaysIcon class="h-4 w-4 text-slate-400" />
                  Tayang: <span class="font-medium text-slate-800">{{ formatDate(announcement.publishedAt) }}</span>
                </div>
                <div class="inline-flex items-center gap-1.5 text-slate-600">
                  <CalendarDaysIcon class="h-4 w-4 text-slate-400" />
                  Kedaluwarsa: <span class="font-medium text-slate-800">{{ formatDate(announcement.expiredAt) }}</span>
                </div>
              </div>

              <!-- Tujuan -->
              <div v-if="announcement.companies?.length || announcement.units?.length" class="mb-4 flex flex-col gap-2">
                <div v-if="announcement.companies?.length">
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Perusahaan</span>
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    <span
                      v-for="c in announcement.companies"
                      :key="c.id"
                      class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-medium text-slate-600"
                    >
                      {{ c.name }}
                    </span>
                  </div>
                </div>
                <div v-if="announcement.units?.length">
                  <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Unit</span>
                  <div class="mt-1 flex flex-wrap gap-1.5">
                    <span
                      v-for="u in announcement.units"
                      :key="u.id"
                      class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-medium text-slate-600"
                    >
                      {{ u.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Isi -->
              <div class="mb-4">
                <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Isi</span>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div
                  v-if="announcement.content"
                  class="prose-mahir mt-1.5 text-[14px] leading-relaxed text-slate-700"
                  v-html="announcement.content"
                ></div>
                <p v-else class="mt-1.5 text-[13px] text-slate-400">Tidak ada isi.</p>
              </div>

              <!-- Lampiran -->
              <div v-if="announcement.attachments?.length">
                <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Lampiran</span>
                <ul class="mt-1.5 flex flex-col gap-2">
                  <li v-for="(att, idx) in announcement.attachments" :key="idx">
                    <a
                      :href="att.file"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-2 rounded-lg border border-mahir-border px-3 py-2 text-[13px] text-mahir-primary hover:bg-slate-50"
                    >
                      <PaperClipIcon class="h-4 w-4 flex-shrink-0" />
                      <span class="truncate">{{ fileName(att.file) }}</span>
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
/* Rapikan konten HTML dari editor. */
.prose-mahir :deep(p) {
  margin-bottom: 0.5rem;
}
.prose-mahir :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.prose-mahir :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.prose-mahir :deep(a) {
  color: #243b8f;
  text-decoration: underline;
}
.prose-mahir :deep(blockquote) {
  border-left: 3px solid #e2e8f0;
  padding-left: 0.75rem;
  color: #64748b;
}
.prose-mahir :deep(h2),
.prose-mahir :deep(h3) {
  font-weight: 700;
  margin: 0.5rem 0;
}
</style>
