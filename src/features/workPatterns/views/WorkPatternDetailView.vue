<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWorkPatternDetail } from "../composables/useWorkPatternDetail";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import WorkPatternScheduleEditor from "../components/WorkPatternScheduleEditor.vue";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = computed(() => route.params.id);
const { workPattern, loading, refetch } = useWorkPatternDetail(id);

// Bisa mengubah jadwal harian bila punya izin create/edit detail (superuser lolos).
const canEditSchedule = computed(() => auth.can([PERM.EDIT_DETAIL, PERM.CREATE_DETAIL]));

const workdayCount = computed(
  () => (workPattern.value?.details ?? []).filter((d) => d.isWorkday).length,
);

function goBack() {
  router.push({ name: "shift", query: { tab: "pola-kerja" } });
}
</script>

<template>
  <div class="mb-5 flex items-center justify-between">
    <button
      class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mahir-muted transition-colors hover:text-slate-900"
      @click="goBack"
    >
      <ArrowLeftIcon class="h-4 w-4" /> Kembali
    </button>
  </div>

  <div
    v-if="loading && !workPattern"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data pola kerja...</p>
  </div>

  <div
    v-else-if="!workPattern"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <CalendarDaysIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data pola kerja tidak ditemukan</p>
    <p class="mt-1 text-xs text-slate-400">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <!-- Header -->
    <div class="mb-6 relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
      <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>
      <div class="flex items-center gap-4">
        <span
          class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-mahir-primary-soft text-2xl text-mahir-primary shadow-inner"
        >
          <CalendarDaysIcon class="h-7 w-7" />
        </span>
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ workPattern.name }}</h1>
          <p class="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <BuildingOffice2Icon class="h-4 w-4 text-slate-400" />
            {{ workPattern.company?.name || "—" }}
            <span class="text-slate-300">•</span>
            {{ workdayCount }} hari kerja
          </p>
        </div>
      </div>
      <p v-if="workPattern.description" class="mt-4 text-sm text-slate-600">
        {{ workPattern.description }}
      </p>
    </div>

    <!-- Jadwal harian -->
    <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
        <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="font-display text-[15px] font-bold text-slate-900">Jadwal Mingguan</h2>
        <span v-if="canEditSchedule" class="ml-auto text-[12px] text-mahir-muted">
          Atur hari kerja &amp; shift lalu simpan
        </span>
      </div>

      <WorkPatternScheduleEditor
        :pattern-id="workPattern.id"
        :details="workPattern.details ?? []"
        :editable="canEditSchedule"
        @saved="refetch"
      />
    </div>
  </template>
</template>
