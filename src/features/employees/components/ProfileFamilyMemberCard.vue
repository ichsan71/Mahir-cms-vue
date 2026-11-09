<script setup>
// Keluarga pada "Profil Saya". Read-only; data dari field nested
// `getEmployee.familyMembers` (GET_MY_PROFILE). Paginasi lewat prop.
import { computed } from "vue";
import ProfileSectionPagination from "./ProfileSectionPagination.vue";
import { formatDate } from "@/shared/utils/format";
import { UsersIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  paginate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

defineEmits(["next", "prev"]);

// `gender` di backend String bebas; MALE/FEMALE dipetakan ke label Indonesia.
const GENDER_LABELS = { MALE: "Laki-laki", FEMALE: "Perempuan" };
function genderLabel(value) {
  if (!value) return "";
  return GENDER_LABELS[value] ?? value;
}

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
        <UsersIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">Keluarga</h2>
        <p class="text-[11.5px] text-slate-400">{{ pagination.count }} anggota</p>
      </div>
    </div>

    <div class="p-5">
      <div v-if="loading && !rows.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat data keluarga…
      </div>

      <div v-else-if="!rows.length" class="py-10 text-center text-sm text-slate-400">
        Belum ada data keluarga untuk Anda.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="m in rows"
          :key="m.id"
          class="rounded-xl border border-mahir-border px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-800">{{ m.name }}</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{{ m.relationship }}</span>
            <span
              v-if="m.isDependent"
              class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600"
            >
              Tanggungan
            </span>
          </div>
          <div class="mt-0.5 text-[12px] text-slate-400">
            <template v-if="m.gender">{{ genderLabel(m.gender) }}</template>
            <template v-if="m.birthDate"> · Lahir {{ formatDate(m.birthDate) }}</template>
            <template v-if="m.occupation"> · {{ m.occupation }}</template>
            <template v-if="m.nik"> · NIK {{ m.nik }}</template>
          </div>
        </div>
      </div>
    </div>

    <ProfileSectionPagination
      :pagination="pagination"
      :shown="rows.length"
      unit-label="anggota"
      @next="$emit('next')"
      @prev="$emit('prev')"
    />
  </div>
</template>
