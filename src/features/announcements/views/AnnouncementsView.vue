<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAnnouncements } from "../composables/useAnnouncements";
import { useAnnouncementForm } from "../composables/useAnnouncementForm";
import AnnouncementToolbar from "../components/AnnouncementToolbar.vue";
import AnnouncementTable from "../components/AnnouncementTable.vue";
import AnnouncementDetailModal from "../components/AnnouncementDetailModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { announcements, pagination, loading, nextPage, prevPage, refetch } = useAnnouncements();
const { deleteAnnouncement, loading: saving } = useAnnouncementForm();

// Detail modal.
const detailOpen = ref(false);
const detailId = ref(null);
function openDetail(row) {
  detailId.value = row.id;
  detailOpen.value = true;
}

function openEdit(row) {
  router.push({ name: "pengumuman-edit", params: { id: row.id } });
}

// Hapus: konfirmasi dulu.
const confirmOpen = ref(false);
const deleteTarget = ref(null);
const deleteMessage = computed(
  () => `Hapus pengumuman "${deleteTarget.value?.title ?? ""}"? Tindakan ini tidak dapat dibatalkan.`,
);
function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}
async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteAnnouncement(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Pengumuman</h1>
      <p class="text-sm text-mahir-muted">Kelola pengumuman untuk perusahaan & unit</p>
    </div>
  </div>

  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Pengumuman
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <AnnouncementToolbar />
    </div>

    <AnnouncementTable
      :announcements="announcements"
      :loading="loading"
      @detail="openDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ announcements.length }} dari {{ pagination.count }} pengumuman</span
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
  <AnnouncementDetailModal v-model:open="detailOpen" :id="detailId" />

  <!-- Konfirmasi hapus -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Pengumuman"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
