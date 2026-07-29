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
  () => ({ params: { page: 1, pageSize: 5 } }),
  () => ({ enabled: canList.value, fetchPolicy: "cache-and-network" }),
);

const items = computed(() => result.value?.listAnnouncement?.data?.results ?? []);

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
    <div class="flex items-center justify-between gap-2 border-b border-mahir-border px-5 py-4">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
          <MegaphoneIcon class="h-5 w-5" />
        </span>
        <h2 class="font-semibold text-slate-900">Pengumuman Terbaru</h2>
      </div>
      <RouterLink
        to="/pengumuman"
        class="inline-flex items-center gap-1 text-[13px] font-medium text-mahir-primary hover:underline"
      >
        Lihat semua <ArrowRightIcon class="h-3.5 w-3.5" />
      </RouterLink>
    </div>

    <!-- List -->
    <div class="p-3">
      <div v-if="loading && !items.length" class="py-8 text-center text-sm text-slate-400">
        Memuat data…
      </div>
      <div v-else-if="!items.length" class="py-8 text-center text-sm text-slate-400">
        Belum ada pengumuman.
      </div>

      <ul v-else class="flex flex-col gap-1.5">
        <li v-for="row in items" :key="row.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl border border-mahir-border bg-white px-3 py-2.5 text-left transition hover:border-mahir-primary/40 hover:bg-slate-50"
            @click="openDetail(row)"
          >
            <BookmarkIcon
              v-if="row.isPinned"
              class="h-4 w-4 flex-shrink-0 text-amber-500"
              title="Disematkan"
            />
            <div class="min-w-0 flex-1">
              <div class="truncate text-[13.5px] font-semibold text-slate-800">{{ row.title || "—" }}</div>
              <div v-if="row.publishedAt" class="text-[11.5px] text-slate-400">
                {{ formatDate(row.publishedAt) }}
              </div>
            </div>
            <StatusBadge v-if="row.status" :status="badgeKey(row.status)" />
          </button>
        </li>
      </ul>
    </div>

    <AnnouncementDetailModal v-model:open="detailOpen" :id="detailId" />
  </div>
</template>
