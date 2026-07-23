<script setup>
import { BuildingOffice2Icon, ShareIcon } from "@heroicons/vue/24/outline";

defineProps({
  approvers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !approvers.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!approvers.length" class="py-10 text-center text-sm text-slate-400">
      Belum ada approver wajib yang cocok.
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="row in approvers"
        :key="row.id"
        class="flex items-center gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Urutan (langkah) -->
        <span
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary text-[15px] font-bold text-white shadow-inner"
        >
          {{ row.order ?? "—" }}
        </span>

        <!-- Perusahaan & unit -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 text-[14px] font-semibold text-slate-800">
            <BuildingOffice2Icon class="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span class="truncate">{{ row.company?.name || "—" }}</span>
          </div>
          <div class="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-mahir-muted">
            <ShareIcon class="h-3.5 w-3.5 flex-shrink-0" />
            <span class="truncate">{{ row.unit?.name || "Semua unit" }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
