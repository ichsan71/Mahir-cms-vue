<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmploymentTypeDetail } from "../composables/useEmploymentTypeDetail";
import { initials } from "@/shared/utils/format";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  IdentificationIcon,
  UsersIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { employmentType, loading } = useEmploymentTypeDetail(id);

const employees = computed(() => employmentType.value?.employees ?? []);

function unitNames(emp) {
  return (emp.units ?? []).map((u) => u.name).join(", ") || "—";
}

function goBack() {
  router.push({ name: "tipe-kepegawaian" });
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
    v-if="loading && !employmentType"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data tipe kepegawaian...</p>
  </div>

  <div
    v-else-if="!employmentType"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <IdentificationIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data tipe kepegawaian tidak ditemukan</p>
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
          <IdentificationIcon class="h-7 w-7" />
        </span>
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ employmentType.name }}</h1>
          <p class="mt-1 text-sm font-medium text-slate-600">
            {{ employees.length }} karyawan dengan tipe ini
          </p>
        </div>
      </div>
    </div>

    <!-- Daftar karyawan -->
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
      <div class="flex items-center gap-2 border-b border-slate-100 p-5">
        <UsersIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="font-display text-[15px] font-bold text-slate-900">Karyawan</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
              <th class="px-4 py-3 font-semibold">Karyawan</th>
              <th class="px-4 py-3 font-semibold">Level</th>
              <th class="px-4 py-3 font-semibold">Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!employees.length">
              <td colspan="3" class="px-4 py-8 text-center text-slate-400">
                Belum ada karyawan dengan tipe ini.
              </td>
            </tr>
            <tr
              v-for="emp in employees"
              :key="emp.id"
              class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                    >{{ initials(emp.fullName) }}</span
                  >
                  <div class="text-[13.5px] font-semibold text-slate-800">{{ emp.fullName }}</div>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ emp.level?.name ?? "—" }}</td>
              <td class="px-4 py-3 text-slate-600">{{ unitNames(emp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>
