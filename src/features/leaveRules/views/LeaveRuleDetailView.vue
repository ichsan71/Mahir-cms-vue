<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLeaveRuleDetail } from "../composables/useLeaveRuleDetail";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { leaveRule, loading } = useLeaveRuleDetail(id);

// Angka → teks ("—" bila kosong; 0 tetap tampil), dengan satuan opsional.
function num(v, unit = "") {
  if (v === null || v === undefined || v === "") return "—";
  return unit ? `${v} ${unit}` : String(v);
}

function goBack() {
  router.push({ name: "pengaturan-cuti", query: { tab: "aturan-cuti" } });
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
    v-if="loading && !leaveRule"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data aturan cuti...</p>
  </div>

  <div
    v-else-if="!leaveRule"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <CalendarDaysIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data aturan cuti tidak ditemukan</p>
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
          <h1 class="text-xl font-bold tracking-tight text-slate-900">
            {{ leaveRule.leaveType?.name || "Aturan Cuti" }}
          </h1>
          <p class="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-600">
            <BuildingOffice2Icon class="h-4 w-4 flex-shrink-0 text-slate-400" />
            <template v-if="leaveRule.companies?.length">
              <span
                v-for="c in leaveRule.companies"
                :key="c.id"
                class="rounded-full bg-mahir-primary-soft px-2 py-0.5 text-[12px] font-semibold text-mahir-primary"
              >
                {{ c.name }}
              </span>
            </template>
            <span v-else>—</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Informasi -->
    <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
      <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
        <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
        <h2 class="font-display text-[15px] font-bold text-slate-900">Ketentuan Cuti</h2>
      </div>

      <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kuota per Tahun</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ num(leaveRule.daysPerYear, "hari") }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Min. Masa Kerja</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ num(leaveRule.minServiceMonth, "bulan") }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Min. Pemberitahuan</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ num(leaveRule.minimumNoticeDays, "hari") }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Maks. Hari Berturut-turut</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ num(leaveRule.maxConsecutiveDays, "hari") }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Setengah Hari</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ leaveRule.allowHalfDay ? "Diizinkan" : "Tidak" }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Saldo Minus</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ leaveRule.allowNegativeBalance ? "Diizinkan" : "Tidak" }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Carry Forward</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ leaveRule.allowCarryForward ? "Diizinkan" : "Tidak" }}</dd>
        </div>
        <div v-if="leaveRule.allowCarryForward">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Maks. Carry Forward</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ num(leaveRule.maxCarryForward, "hari") }}</dd>
        </div>
        <div v-if="leaveRule.allowCarryForward">
          <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kedaluwarsa Carry Forward</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">
            {{ num(leaveRule.carryForwardExpireAfterMonths, "bulan") }}
          </dd>
        </div>
      </div>
    </div>
  </template>
</template>
