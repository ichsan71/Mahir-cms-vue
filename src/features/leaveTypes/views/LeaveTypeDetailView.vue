<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@vue/apollo-composable";
import { useLeaveTypeDetail } from "../composables/useLeaveTypeDetail";
import { LIST_SALARY_COMPONENT_TYPE } from "@/features/salaryComponentTypes/graphql/salaryComponentType.queries";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  TagIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { leaveType, loading } = useLeaveTypeDetail(id);

// Katalog komponen gaji aktif untuk memetakan id → nama komponen yang dibayar.
const { result: catalogResult } = useQuery(
  LIST_SALARY_COMPONENT_TYPE,
  () => ({ params: { isActive: true, page: 1, pageSize: 100 } }),
  { fetchPolicy: "cache-and-network" },
);
const componentMap = computed(() => {
  const map = {};
  for (const c of catalogResult.value?.listSalaryComponentType?.data?.results ?? []) {
    map[String(c.id)] = c.code ? `${c.name} (${c.code})` : c.name;
  }
  return map;
});
const paidComponents = computed(() =>
  (leaveType.value?.paidSalaryComponentIds ?? []).map(
    (cid) => componentMap.value[String(cid)] ?? `Komponen #${cid}`,
  ),
);
const isPaid = computed(() => (leaveType.value?.paidSalaryComponentIds?.length ?? 0) > 0);

// Status kehadiran yang dicatat saat karyawan menjalani cuti jenis ini.
const ATTENDANCE_STATUS = {
  ON_LEAVE: "Cuti",
  SICK: "Sakit",
  PERMISSION: "Izin",
};
const attendanceStatusLabel = computed(() => {
  const v = leaveType.value?.attendanceStatus;
  return v ? (ATTENDANCE_STATUS[v] ?? v) : "—";
});

// Ringkasan alur persetujuan (needApproval + useParentApproval).
const approvalInfo = computed(() => {
  const t = leaveType.value;
  if (!t?.needApproval) {
    return { title: "Tidak perlu persetujuan", desc: "Pengajuan langsung disetujui otomatis.", on: false };
  }
  return t.useParentApproval
    ? { title: "Perlu persetujuan — Atasan langsung", desc: "Penyetuju diambil dari hierarki atasan karyawan.", on: true }
    : { title: "Perlu persetujuan — Approver wajib", desc: "Penyetuju diambil dari approver wajib yang dikonfigurasi.", on: true };
});

// Daftar ketentuan boolean untuk ditampilkan sebagai badge ya/tidak.
const flags = computed(() => {
  const t = leaveType.value;
  if (!t) return [];
  return [
    { label: "Perlu alasan", on: t.needReason },
    { label: "Perlu lampiran", on: t.needAttachment },
    { label: "Perlu persetujuan", on: t.needApproval },
    { label: "Wajib absen (clock-in)", on: t.needClockIn },
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Ketentuan -->
      <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
          <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
          <h2 class="font-display text-[15px] font-bold text-slate-900">Ketentuan</h2>
        </div>

        <ul class="space-y-2.5">
          <li
            v-for="f in flags"
            :key="f.label"
            class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
          >
            <span class="text-sm font-medium text-slate-700">{{ f.label }}</span>
            <span
              class="inline-flex items-center gap-1.5 text-[13px] font-semibold"
              :class="f.on ? 'text-mahir-success' : 'text-slate-400'"
            >
              <CheckCircleIcon v-if="f.on" class="h-4 w-4" />
              <XCircleIcon v-else class="h-4 w-4" />
              {{ f.on ? "Ya" : "Tidak" }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Persetujuan, komponen gaji, status kehadiran -->
      <div class="space-y-6">
        <!-- Alur persetujuan -->
        <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ClipboardDocumentCheckIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Persetujuan</h2>
          </div>
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              :class="approvalInfo.on ? 'bg-mahir-primary-soft text-mahir-primary' : 'bg-slate-100 text-slate-400'"
            >
              <UserGroupIcon class="h-4 w-4" />
            </span>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ approvalInfo.title }}</p>
              <p class="mt-0.5 text-[12.5px] text-mahir-muted">{{ approvalInfo.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Komponen gaji dibayar saat cuti -->
        <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BanknotesIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Komponen Gaji Dibayar</h2>
            <span
              class="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="isPaid ? 'bg-mahir-success-soft text-mahir-success' : 'bg-slate-100 text-slate-500'"
            >
              {{ isPaid ? "Berbayar" : "Tidak Berbayar" }}
            </span>
          </div>
          <div v-if="isPaid" class="flex flex-wrap gap-1.5">
            <span
              v-for="(c, i) in paidComponents"
              :key="i"
              class="rounded-lg bg-slate-100 px-2.5 py-1 text-[12.5px] font-medium text-slate-700"
            >
              {{ c }}
            </span>
          </div>
          <p v-else class="text-[13px] text-mahir-muted">
            Tidak ada komponen gaji yang dibayarkan selama cuti jenis ini.
          </p>
        </div>

        <!-- Status kehadiran -->
        <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <TagIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Status Kehadiran</h2>
          </div>
          <p class="text-sm text-slate-700">
            Dicatat sebagai
            <span class="font-semibold text-slate-900">{{ attendanceStatusLabel }}</span>
            pada data kehadiran karyawan.
          </p>
        </div>
      </div>
    </div>
  </template>
</template>
