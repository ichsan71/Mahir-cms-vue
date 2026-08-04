<script setup>
// Kartu ringkas daftar pengumuman terbaru untuk Dashboard. Self-gating: hanya
// tampil bila akun punya izin listAnnouncement. Klik item → modal detail.
import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { RouterLink } from "vue-router";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate } from "@/shared/utils/format";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { LIST_ANNOUNCEMENT } from "../graphql/announcement.queries";
import { PERM } from "../permissions";
import AnnouncementDetailModal from "./AnnouncementDetailModal.vue";
import { MegaphoneIcon, BookmarkIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const canList = computed(() => auth.can(PERM.LIST));

// Ambil beberapa pengumuman terbaru (hanya bila diizinkan).
const { result, loading } = useQuery(
  LIST_ANNOUNCEMENT,
  () => ({ params: { page: 1, pageSize: 4 } }),
  () => ({ enabled: canList.value, fetchPolicy: "cache-and-network" }),
);

// Pengumuman yang disematkan (isPinned) tampil paling atas; sisanya
// mengikuti urutan dari server. Pakai index sebagai tie-breaker agar stabil.
const items = computed(() => {
  const rows = result.value?.listAnnouncement?.data?.results ?? [];
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const pin = Number(Boolean(b.row.isPinned)) - Number(Boolean(a.row.isPinned));
      return pin !== 0 ? pin : a.index - b.index;
    })
    .map((entry) => entry.row);
});

function badgeKey(s) {
  return String(s ?? "").toLowerCase();
}

// Detail modal.
const detailOpen = ref(false);
const detailId = ref(null);
function openDetail(row) {
  detailId.value = row.id;
  detailOpen.value = true;
}
</script>

<template>
  <div v-if="canList" class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 border-b border-mahir-border px-4 py-3">
      <div class="flex items-center gap-2">
        <MegaphoneIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="text-[14px] font-semibold text-slate-900">Pengumuman Terbaru</h2>
      </div>
      <RouterLink
        to="/pengumuman"
        class="inline-flex items-center gap-1 text-[12.5px] font-medium text-mahir-primary hover:underline"
      >
        Lihat semua <ArrowRightIcon class="h-3.5 w-3.5" />
      </RouterLink>
    </div>

    <!-- List -->
    <div>
      <div v-if="loading && !items.length" class="py-6 text-center text-sm text-slate-400">
        Memuat data…
      </div>
      <div v-else-if="!items.length" class="py-6 text-center text-sm text-slate-400">
        Belum ada pengumuman.
      </div>

      <ul v-else class="divide-y divide-slate-100">
        <li v-for="row in items" :key="row.id">
          <button
            type="button"
            class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-slate-50"
            @click="openDetail(row)"
          >
            <BookmarkIcon
              v-if="row.isPinned"
              class="h-3.5 w-3.5 flex-shrink-0 text-amber-500"
              title="Disematkan"
            />
            <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-800">
              {{ row.title || "—" }}
            </span>
            <span v-if="row.publishedAt" class="hidden flex-shrink-0 text-[11.5px] text-slate-400 sm:block">
              {{ formatDate(row.publishedAt) }}
            </span>
            <StatusBadge v-if="row.status" :status="badgeKey(row.status)" />
          </button>
        </li>
      </ul>
    </div>

    <AnnouncementDetailModal v-model:open="detailOpen" :id="detailId" />
  </div>
</template>
