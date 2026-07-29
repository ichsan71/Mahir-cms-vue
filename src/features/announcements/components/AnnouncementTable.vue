<script setup>
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate } from "@/shared/utils/format";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import {
  MegaphoneIcon,
  BookmarkIcon,
  BuildingOffice2Icon,
  ShareIcon,
  PaperClipIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  announcements: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

function badgeKey(s) {
  return String(s ?? "").toLowerCase();
}
function names(list) {
  return (list || []).map((x) => x?.name).filter(Boolean);
}
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !announcements.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!announcements.length" class="py-10 text-center text-sm text-slate-400">
      Belum ada pengumuman yang cocok.
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="row in announcements"
        :key="row.id"
        class="group flex items-start gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Ikon -->
        <span class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <MegaphoneIcon class="h-5 w-5" />
        </span>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="row.isPinned"
              class="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700"
            >
              <BookmarkIcon class="h-3 w-3" /> Pin
            </span>
            <span class="truncate text-[14px] font-semibold text-slate-800">{{ row.title || "—" }}</span>
            <StatusBadge v-if="row.status" :status="badgeKey(row.status)" />
          </div>

          <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
            <span v-if="row.publishedAt" class="text-slate-400">
              Tayang {{ formatDate(row.publishedAt) }}
            </span>
            <span v-if="names(row.companies).length" class="inline-flex items-center gap-1">
              <BuildingOffice2Icon class="h-3.5 w-3.5 text-slate-400" />
              {{ names(row.companies).join(", ") }}
            </span>
            <span v-if="names(row.units).length" class="inline-flex items-center gap-1">
              <ShareIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ names(row.units).join(", ") }}
            </span>
            <span v-if="(row.attachments || []).length" class="inline-flex items-center gap-1">
              <PaperClipIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ row.attachments.length }} lampiran
            </span>
          </div>
        </div>

        <!-- Aksi -->
        <div class="flex flex-shrink-0 items-center gap-1.5">
          <button
            class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
            title="Lihat detail"
            @click="emit('detail', row)"
          >
            <EyeIcon class="h-3.5 w-3.5" /> Detail
          </button>
          <button
            v-if="auth.can(PERM.EDIT)"
            class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
            title="Ubah"
            @click="emit('edit', row)"
          >
            <PencilSquareIcon class="h-3.5 w-3.5" /> Ubah
          </button>
          <button
            v-if="auth.can(PERM.DELETE)"
            class="inline-flex items-center gap-1 rounded-lg border border-mahir-danger/30 px-2.5 py-1 text-[12px] font-semibold text-mahir-danger hover:bg-mahir-danger-soft"
            title="Hapus"
            @click="emit('delete', row)"
          >
            <TrashIcon class="h-3.5 w-3.5" /> Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
