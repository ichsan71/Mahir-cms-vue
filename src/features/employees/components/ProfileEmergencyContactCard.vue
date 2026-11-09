<script setup>
// Kontak Darurat pada "Profil Saya". Read-only; data dari field nested
// `getEmployee.emergencyContacts` (GET_MY_PROFILE). Paginasi lewat prop.
import { computed } from "vue";
import ProfileSectionPagination from "./ProfileSectionPagination.vue";
import { LifebuoyIcon, ArrowPathIcon, StarIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  paginate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

defineEmits(["next", "prev"]);

const rows = computed(() => props.paginate?.results ?? []);
const pagination = computed(() => {
  const count = props.paginate?.count ?? 0;
  return {
    count,
    currentPage: props.paginate?.currentPage ?? 1,
    totalPages: props.paginate?.totalPages ?? Math.max(1, Math.ceil(count / 10)),
    hasNext: props.paginate?.hasNext ?? false,
    hasPrev: props.paginate?.hasPrev ?? false,
  };
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <LifebuoyIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Kontak Darurat</h2>
        <p class="text-[11.5px] text-slate-400">{{ pagination.count }} kontak</p>
      </div>
    </div>

    <div class="p-5">
      <div v-if="loading && !rows.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat kontak…
      </div>

      <div v-else-if="!rows.length" class="py-10 text-center text-sm text-slate-400">
        Belum ada kontak darurat untuk Anda.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="c in rows"
          :key="c.id"
          class="rounded-xl border border-mahir-border px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-800">{{ c.name }}</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{{ c.relationship }}</span>
            <span
              v-if="c.isPrimary"
              class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600"
            >
              <StarIcon class="h-3 w-3" /> Utama
            </span>
          </div>
          <div class="mt-0.5 text-[13px] text-slate-600">
            {{ c.phone }}
            <template v-if="c.alternatePhone"> · {{ c.alternatePhone }}</template>
          </div>
          <div v-if="c.address" class="mt-0.5 text-[12px] text-slate-400">{{ c.address }}</div>
        </div>
      </div>
    </div>

    <ProfileSectionPagination
      :pagination="pagination"
      :shown="rows.length"
      unit-label="kontak"
      @next="$emit('next')"
      @prev="$emit('prev')"
    />
  </div>
</template>
