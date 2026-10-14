<script setup>
import { formatDate } from "@/shared/utils/format";
import { prettyEnum } from "@/shared/composables/useEnumChoices";
import {
  DocumentTextIcon,
  TagIcon,
  DevicePhoneMobileIcon,
  PaperClipIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  changelogs: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail"]);

function pretty(v) {
  return v ? prettyEnum(v) : "—";
}
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !changelogs.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!changelogs.length" class="py-10 text-center text-sm text-slate-400">
      Belum ada changelog yang cocok.
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="row in changelogs"
        :key="row.id"
        class="group flex items-start gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Ikon -->
        <span class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <DocumentTextIcon class="h-5 w-5" />
        </span>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="truncate text-[14px] font-semibold text-slate-800">{{ row.title || "—" }}</span>
            <span
              v-if="row.version"
              class="inline-flex items-center rounded bg-mahir-primary-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-primary"
            >
              v{{ row.version }}
            </span>
          </div>

          <p v-if="row.description" class="mt-0.5 line-clamp-1 text-[12px] text-slate-500">
            {{ row.description }}
          </p>

          <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
            <span class="inline-flex items-center gap-1">
              <DevicePhoneMobileIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ pretty(row.appName) }}
            </span>
            <span class="inline-flex items-center gap-1">
              <TagIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ pretty(row.changeType) }}
            </span>
            <span class="text-slate-400">{{ pretty(row.platform) }}</span>
            <span v-if="row.createdAt" class="text-slate-400">{{ formatDate(row.createdAt) }}</span>
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
        </div>
      </div>
    </div>
  </div>
</template>
