<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useShiftDetail } from "../composables/useShiftDetail";
import { prettyEnum } from "@/shared/composables/useEnumChoices";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { shift, loading } = useShiftDetail(id);

function fmtTime(t) {
  return t ? String(t).slice(0, 5) : "—";
}

function goBack() {
  router.push({ name: "shift" });
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
    v-if="loading && !shift"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data shift...</p>
  </div>

  <div
    v-else-if="!shift"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <ClockIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data shift tidak ditemukan</p>
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
          <ClockIcon class="h-7 w-7" />
        </span>
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ shift.name }}</h1>
          <p class="mt-1 text-sm font-medium text-slate-600">
            {{ prettyEnum(shift.startDay) }} – {{ prettyEnum(shift.endDay) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Informasi -->
    <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
        <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="font-display text-[15px] font-bold text-slate-900">Informasi Shift</h2>
      </div>

      <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hari Mulai</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ prettyEnum(shift.startDay) || "—" }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hari Selesai</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ prettyEnum(shift.endDay) || "—" }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jam Mulai</dt>
          <dd class="mt-0.5 font-mono text-sm font-medium text-slate-800">{{ fmtTime(shift.startTime) }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Jam Selesai</dt>
          <dd class="mt-0.5 font-mono text-sm font-medium text-slate-800">{{ fmtTime(shift.endTime) }}</dd>
        </div>
      </div>
    </div>
  </template>
</template>
