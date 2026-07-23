<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLeaveTypeDetail } from "../composables/useLeaveTypeDetail";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  TagIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { leaveType, loading } = useLeaveTypeDetail(id);

// Daftar ketentuan boolean untuk ditampilkan sebagai badge ya/tidak.
const flags = computed(() => {
  const t = leaveType.value;
  if (!t) return [];
  return [
    { label: "Berbayar", on: t.isPaid },
    { label: "Perlu alasan", on: t.needReason },
    { label: "Perlu lampiran", on: t.needAttachment },
    { label: "Perlu persetujuan", on: t.needApproval },
    { label: "Aktif", on: t.isActive },
  ];
});

function goBack() {
  router.push({ name: "pengaturan-cuti", query: { tab: "tipe-cuti" } });
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
    v-if="loading && !leaveType"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data tipe cuti...</p>
  </div>

  <div
    v-else-if="!leaveType"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <TagIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data tipe cuti tidak ditemukan</p>
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
          <TagIcon class="h-7 w-7" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ leaveType.name }}</h1>
            <span
              v-if="!leaveType.isActive"
              class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500"
            >
              Nonaktif
            </span>
          </div>
          <p class="mt-1 text-sm font-medium text-slate-600">
            <span v-if="leaveType.code" class="font-mono">{{ leaveType.code }}</span>
            <span v-else>—</span>
          </p>
        </div>
      </div>
      <p v-if="leaveType.description" class="mt-4 text-sm text-slate-600">{{ leaveType.description }}</p>
    </div>

    <!-- Ketentuan -->
    <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
        <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="font-display text-[15px] font-bold text-slate-900">Ketentuan</h2>
      </div>

      <div class="grid grid-cols-2 gap-y-4 sm:grid-cols-3 sm:gap-x-8">
        <div v-for="f in flags" :key="f.label">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{{ f.label }}</dt>
          <dd class="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <span
              class="inline-block h-2 w-2 rounded-full"
              :class="f.on ? 'bg-mahir-primary' : 'bg-slate-300'"
            ></span>
            {{ f.on ? "Ya" : "Tidak" }}
          </dd>
        </div>
      </div>
    </div>
  </template>
</template>
