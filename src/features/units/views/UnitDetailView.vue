<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUnitDetail } from "../composables/useUnitDetail";
import { unitTypeLabel } from "../constants";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ShareIcon,
  InformationCircleIcon,
  ArrowUpRightIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { unit, loading } = useUnitDetail(id);

// parentTree/childrenTree bentuknya belum pasti (bisa array, string, atau objek).
// Normalkan menjadi array label agar aman dirender.
function treeItems(tree) {
  if (!tree) return [];
  const arr = Array.isArray(tree) ? tree : [tree];
  return arr
    .map((node) => {
      if (node == null) return null;
      if (typeof node === "string" || typeof node === "number") return String(node);
      return node.name || node.fullCode || node.code || node.label || String(node.id ?? "");
    })
    .filter(Boolean);
}

const parentItems = computed(() => treeItems(unit.value?.parentTree));
const childrenItems = computed(() => treeItems(unit.value?.childrenTree));

function goBack() {
  router.push({ name: "unit" });
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
    v-if="loading && !unit"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data unit...</p>
  </div>

  <div
    v-else-if="!unit"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <ShareIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data unit tidak ditemukan</p>
    <p class="mt-1 text-xs text-slate-400">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Header -->
        <div class="relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-mahir-primary-soft text-2xl text-mahir-primary shadow-inner"
            >
              <ShareIcon class="h-7 w-7" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ unit.name }}</h1>
                <span
                  class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                >
                  {{ unitTypeLabel(unit.unitType) }}
                </span>
              </div>
              <div class="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span>Kode: <strong class="font-mono text-slate-600">{{ unit.code || "—" }}</strong></span>
                <span class="text-slate-300">|</span>
                <span>Kode Penuh: <strong class="font-mono text-slate-600">{{ unit.fullCode || "—" }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informasi -->
        <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Informasi Unit</h2>
          </div>

          <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama Unit</dt>
              <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ unit.name }}</dd>
            </div>
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tipe Unit</dt>
              <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ unitTypeLabel(unit.unitType) }}</dd>
            </div>
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kode</dt>
              <dd class="mt-0.5 font-mono text-sm font-medium text-slate-800">{{ unit.code || "—" }}</dd>
            </div>
            <div>
              <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kode Penuh</dt>
              <dd class="mt-0.5 font-mono text-sm font-medium text-slate-800">{{ unit.fullCode || "—" }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: hierarki -->
      <div class="space-y-6">
        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Unit Induk</h2>
          <div
            v-if="!parentItems.length"
            class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400"
          >
            Tidak ada unit induk.
          </div>
          <ol v-else class="space-y-1.5">
            <li
              v-for="(node, i) in parentItems"
              :key="i"
              class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <ArrowUpRightIcon class="h-4 w-4 shrink-0 text-slate-400" />
              <span class="truncate">{{ node }}</span>
            </li>
          </ol>
        </div>

        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Sub Unit</h2>
          <div
            v-if="!childrenItems.length"
            class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400"
          >
            Belum ada sub unit.
          </div>
          <ul v-else class="space-y-1.5">
            <li
              v-for="(node, i) in childrenItems"
              :key="i"
              class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <ShareIcon class="h-4 w-4 shrink-0 text-slate-400" />
              <span class="truncate">{{ node }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
</template>
