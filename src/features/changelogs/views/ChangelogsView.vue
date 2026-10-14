<script setup>
import { ref } from "vue";
import { useChangelogs } from "../composables/useChangelogs";
import ChangelogToolbar from "../components/ChangelogToolbar.vue";
import ChangelogTable from "../components/ChangelogTable.vue";
import ChangelogDetailModal from "../components/ChangelogDetailModal.vue";

const { changelogs, pagination, loading, nextPage, prevPage } = useChangelogs();

// Detail modal.
const detailOpen = ref(false);
const detailId = ref(null);
function openDetail(row) {
  detailId.value = row.id;
  detailOpen.value = true;
}
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Changelog</h1>
      <p class="text-sm text-mahir-muted">Riwayat perubahan & rilis aplikasi</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Changelog
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <ChangelogToolbar />
    </div>

    <ChangelogTable :changelogs="changelogs" :loading="loading" @detail="openDetail" />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ changelogs.length }} dari {{ pagination.count }} changelog</span
      >
      <nav class="flex items-center gap-1">
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasPrev"
          @click="prevPage"
        >
          ‹
        </button>
        <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
          {{ pagination.currentPage }}
        </span>
        <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasNext"
          @click="nextPage"
        >
          ›
        </button>
      </nav>
    </div>
  </div>

  <!-- Detail -->
  <ChangelogDetailModal v-model:open="detailOpen" :id="detailId" />
</template>
