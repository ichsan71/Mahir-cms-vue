<script setup>
// Port dari resources/views/pages/recruitment/index.blade.php + modules/recruitment.js
import { ref } from "vue";
import { useRecruitment } from "../composables/useRecruitment";
import JobFormModal from "../components/JobFormModal.vue";
import PageHeader from "@/shared/components/PageHeader.vue";
import StatsCard from "@/shared/components/StatsCard.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import SearchInput from "@/shared/components/SearchInput.vue";
import { initials } from "@/shared/utils/format";
import {
  PlusIcon,
  UsersIcon,
  PencilIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/vue/24/outline";

const {
  jobFilters, applFilters, jobs, applicants, stats, stageCounts,
  jobsLoading, applLoading, createJob, moveStage,
} = useRecruitment();

const jobModalOpen = ref(false);

const STAGE_TABS = [
  { stage: "screening", label: "Screening" },
  { stage: "interview", label: "Interview" },
  { stage: "offer", label: "Penawaran" },
  { stage: "hired", label: "Diterima" },
  { stage: "rejected", label: "Ditolak" },
];

const JOB_OPTIONS = [
  "Frontend Developer", "HR Business Partner", "Finance Analyst",
  "UI/UX Designer", "Backend Engineer", "Digital Marketing Specialist",
];

// Aksi lanjut tahap berdasarkan tahap saat ini
function nextAction(stage) {
  return {
    screening: { to: "interview", label: "Interview" },
    interview: { to: "offer", label: "Beri Penawaran" },
    offer: { to: "hired", label: "Terima" },
  }[stage];
}

function setStageTab(stage) {
  applFilters.stage = applFilters.stage === stage ? "" : stage;
}

async function handleCreateJob(input) {
  await createJob(input);
  jobModalOpen.value = false;
}

function filterByJob(title) {
  applFilters.job = title;
}
</script>

<template>
  <PageHeader title="Manajemen Rekrutmen" subtitle="Pipeline pelamar & pengelolaan lowongan kerja">
    <template #actions>
      <button
        class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
        @click="jobModalOpen = true"
      >
        <PlusIcon class="h-4 w-4" /> Buka Lowongan Baru
      </button>
    </template>
  </PageHeader>

  <!-- Stats -->
  <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatsCard :value="stats?.openJobs ?? '—'" label="Posisi Terbuka" :icon="BriefcaseIcon" color="#243B8F" bg-color="#E7EEFF" />
    <StatsCard :value="stats?.totalApplicants ?? '—'" label="Total Pelamar" :icon="UsersIcon" color="#2884E8" bg-color="#E4F1FF" />
    <StatsCard :value="stats?.inProcess ?? '—'" label="Dalam Proses" :icon="ClockIcon" color="#D98E18" bg-color="#FFF3DA" />
    <StatsCard :value="stats?.hired ?? '—'" label="Berhasil Diterima" :icon="CheckBadgeIcon" color="#1B9C67" bg-color="#E2F8EC" />
  </div>

  <!-- Job Openings -->
  <div class="mb-6 overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">Daftar Lowongan</h2>
      <div class="flex flex-wrap items-center gap-2">
        <SearchInput v-model="jobFilters.search" placeholder="Cari posisi atau departemen..." width="220px" />
        <select v-model="jobFilters.status" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Status</option>
          <option value="open">Terbuka</option>
          <option value="closed">Ditutup</option>
        </select>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="px-4 py-3 font-semibold">ID</th>
            <th class="px-4 py-3 font-semibold">Posisi</th>
            <th class="px-4 py-3 font-semibold">Kuota</th>
            <th class="px-4 py-3 font-semibold">Pelamar</th>
            <th class="px-4 py-3 font-semibold">Deadline</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!jobs.length">
            <td colspan="7" class="px-4 py-8 text-center text-slate-400">{{ jobsLoading ? "Memuat…" : "Tidak ada lowongan." }}</td>
          </tr>
          <tr v-for="j in jobs" :key="j.id" class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60">
            <td class="px-4 py-3 font-semibold text-mahir-primary">{{ j.id }}</td>
            <td class="px-4 py-3">
              <div class="font-semibold text-slate-800">{{ j.title }}</div>
              <div class="text-[11.5px] text-slate-400">{{ j.dept }}</div>
            </td>
            <td class="px-4 py-3"><span class="rounded-md border border-mahir-border bg-slate-50 px-2 py-1 text-xs text-slate-600">{{ j.quota }} Slot</span></td>
            <td class="px-4 py-3 text-slate-600">{{ j.applied }} Pelamar</td>
            <td class="px-4 py-3 text-slate-600">{{ j.deadline }}</td>
            <td class="px-4 py-3"><StatusBadge :status="j.status" /></td>
            <td class="px-4 py-3">
              <div class="flex gap-1.5">
                <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" title="Lihat Pelamar" @click="filterByJob(j.title)">
                  <UsersIcon class="h-4 w-4" />
                </button>
                <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" title="Edit">
                  <PencilIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Applicant pipeline -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="mb-2 font-semibold text-slate-900">Pipeline Pelamar</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in STAGE_TABS"
            :key="t.stage"
            class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
            :class="applFilters.stage === t.stage ? 'border-mahir-primary bg-mahir-primary-soft text-mahir-primary' : 'border-mahir-border bg-slate-50 text-slate-600'"
            @click="setStageTab(t.stage)"
          >
            {{ t.label }}
            <span class="rounded-full bg-white px-1.5 text-[11px] font-semibold">{{ stageCounts[t.stage] ?? 0 }}</span>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <SearchInput v-model="applFilters.search" placeholder="Cari nama pelamar..." />
        <select v-model="applFilters.stage" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Tahap</option>
          <option v-for="t in STAGE_TABS" :key="t.stage" :value="t.stage">{{ t.label }}</option>
        </select>
        <select v-model="applFilters.job" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Posisi</option>
          <option v-for="j in JOB_OPTIONS" :key="j" :value="j">{{ j }}</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="px-4 py-3 font-semibold">Pelamar</th>
            <th class="px-4 py-3 font-semibold">Posisi</th>
            <th class="px-4 py-3 font-semibold">Tahap</th>
            <th class="px-4 py-3 font-semibold">Tgl Lamar</th>
            <th class="px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!applicants.length">
            <td colspan="5" class="px-4 py-8 text-center text-slate-400">{{ applLoading ? "Memuat…" : "Tidak ada pelamar." }}</td>
          </tr>
          <tr v-for="a in applicants" :key="a.id" class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary">{{ initials(a.name) }}</span>
                <div>
                  <div class="text-[13.5px] font-semibold text-slate-800">{{ a.name }}</div>
                  <div class="text-[11.5px] text-slate-400">{{ a.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ a.job }}</td>
            <td class="px-4 py-3"><StatusBadge :status="a.stage" /></td>
            <td class="px-4 py-3 text-slate-600">{{ a.applied }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap items-center gap-1.5">
                <button
                  v-if="nextAction(a.stage)"
                  class="rounded-md border border-mahir-primary px-2 py-1 text-xs font-medium text-mahir-primary hover:bg-mahir-primary-soft"
                  @click="moveStage(a.id, nextAction(a.stage).to)"
                >
                  {{ nextAction(a.stage).label }}
                </button>
                <button
                  v-if="['screening', 'interview', 'offer'].includes(a.stage)"
                  class="rounded-md border border-mahir-danger px-2 py-1 text-xs font-medium text-mahir-danger hover:bg-mahir-danger-soft"
                  @click="moveStage(a.id, 'rejected')"
                >
                  Tolak
                </button>
                <span v-if="['hired', 'rejected'].includes(a.stage)" class="text-slate-300">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-mahir-border px-5 py-3 text-[13px] text-mahir-muted">
      {{ applicants.length }} pelamar
    </div>
  </div>

  <JobFormModal v-model:open="jobModalOpen" @save="handleCreateJob" />
</template>
