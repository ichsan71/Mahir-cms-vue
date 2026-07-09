<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBranchDetail } from "../composables/useBranchDetail";
import { initials } from "@/shared/utils/format";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  MapPinIcon,
  UsersIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { branch, loading } = useBranchDetail(id);

const companies = computed(() => branch.value?.companies ?? []);
const employees = computed(() => branch.value?.employees ?? []);

function goBack() {
  router.push({ name: "cabang" });
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
    v-if="loading && !branch"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data cabang...</p>
  </div>

  <div
    v-else-if="!branch"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <MapPinIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data cabang tidak ditemukan</p>
    <p class="mt-1 text-xs text-slate-400">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Header -->
        <div class="relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>
          <div class="flex items-center gap-4">
            <span
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-mahir-primary-soft text-2xl text-mahir-primary shadow-inner"
            >
              <MapPinIcon class="h-7 w-7" />
            </span>
            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ branch.name }}</h1>
              <p class="mt-1 text-sm font-medium text-slate-600">
                {{ employees.length }} karyawan · {{ companies.length }} perusahaan
              </p>
            </div>
          </div>
        </div>

        <!-- Karyawan -->
        <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
          <div class="flex items-center gap-2 border-b border-slate-100 p-5">
            <UsersIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Karyawan</h2>
          </div>
          <div
            v-if="!employees.length"
            class="px-5 py-8 text-center text-sm text-slate-400"
          >
            Belum ada karyawan pada cabang ini.
          </div>
          <ul v-else class="divide-y divide-mahir-border">
            <li v-for="emp in employees" :key="emp.id" class="flex items-center gap-2.5 px-5 py-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                >{{ initials(emp.fullName) }}</span
              >
              <span class="text-[13.5px] font-semibold text-slate-800">{{ emp.fullName }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sidebar: perusahaan -->
      <div class="space-y-6">
        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Perusahaan</h2>
          <div
            v-if="!companies.length"
            class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400"
          >
            Belum ada perusahaan terkait.
          </div>
          <ul v-else class="space-y-1.5">
            <li
              v-for="c in companies"
              :key="c.id"
              class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <BuildingOffice2Icon class="h-4 w-4 shrink-0 text-slate-400" />
              <span class="truncate">{{ c.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
</template>
