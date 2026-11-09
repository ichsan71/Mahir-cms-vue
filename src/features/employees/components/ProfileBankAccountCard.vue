<script setup>
// Rekening Bank pada "Profil Saya". Read-only; data dari field nested
// `getEmployee.bankAccounts` (GET_MY_PROFILE). Menerima paginasi lewat prop.
import { computed } from "vue";
import ProfileSectionPagination from "./ProfileSectionPagination.vue";
import { BuildingLibraryIcon, ArrowPathIcon, StarIcon } from "@heroicons/vue/24/outline";

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
        <BuildingLibraryIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Rekening Bank</h2>
        <p class="text-[11.5px] text-slate-400">{{ pagination.count }} rekening</p>
      </div>
    </div>

    <div class="p-5">
      <div v-if="loading && !rows.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat rekening…
      </div>

      <div v-else-if="!rows.length" class="py-10 text-center text-sm text-slate-400">
        Belum ada rekening bank untuk Anda.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="a in rows"
          :key="a.id"
          class="rounded-xl border border-mahir-border px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-800">{{ a.bankName }}</span>
            <span
              v-if="a.isPrimary"
              class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600"
            >
              <StarIcon class="h-3 w-3" /> Utama
            </span>
          </div>
          <div class="mt-0.5 font-mono text-[13px] text-slate-600">{{ a.accountNumber }}</div>
          <div class="mt-0.5 text-[12px] text-slate-400">
            a.n. {{ a.accountHolderName }}
            <template v-if="a.branchName"> · Cabang {{ a.branchName }}</template>
            <template v-if="a.bankCode"> · Kode {{ a.bankCode }}</template>
          </div>
        </div>
      </div>
    </div>

    <ProfileSectionPagination
      :pagination="pagination"
      :shown="rows.length"
      unit-label="rekening"
      @next="$emit('next')"
      @prev="$emit('prev')"
    />
  </div>
</template>
