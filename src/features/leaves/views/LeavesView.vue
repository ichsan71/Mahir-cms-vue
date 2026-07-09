<script setup>
// Port dari resources/views/pages/leaves/index.blade.php + modules/leaves.js
import { ref } from "vue";
import { useLeaves } from "../composables/useLeaves";
import LeaveFormModal from "../components/LeaveFormModal.vue";
import PageHeader from "@/shared/components/PageHeader.vue";
import StatsCard from "@/shared/components/StatsCard.vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import SearchInput from "@/shared/components/SearchInput.vue";
import { initials } from "@/shared/utils/format";
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";

const { filters, leaves, stats, loading, approve, reject, createLeave } = useLeaves();

const modalOpen = ref(false);

async function handleSave(input) {
  await createLeave(input);
  modalOpen.value = false;
}
</script>

<template>
  <PageHeader title="Manajemen Cuti & Izin" subtitle="Approval workflow pengajuan cuti dan izin karyawan">
    <template #actions>
      <button
        class="flex items-center gap-2 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90"
        @click="modalOpen = true"
      >
        <PlusIcon class="h-4 w-4" /> Tambah Pengajuan
      </button>
    </template>
  </PageHeader>

  <!-- Stats -->
  <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <StatsCard :value="stats?.total ?? '—'" label="Total Pengajuan" :icon="DocumentTextIcon" color="#243B8F" bg-color="#E7EEFF" />
    <StatsCard :value="stats?.pending ?? '—'" label="Menunggu Approval" :icon="ClockIcon" color="#D98E18" bg-color="#FFF3DA" />
    <StatsCard :value="stats?.approved ?? '—'" label="Disetujui" :icon="CheckCircleIcon" color="#1B9C67" bg-color="#E2F8EC" />
    <StatsCard :value="stats?.rejected ?? '—'" label="Ditolak" :icon="XCircleIcon" color="#D14343" bg-color="#FCE7E7" />
  </div>

  <!-- Table -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">Daftar Pengajuan Cuti & Izin</h2>
      <div class="flex flex-wrap items-center gap-2">
        <SearchInput v-model="filters.search" placeholder="Cari karyawan..." />
        <select v-model="filters.status" class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none">
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th class="px-4 py-3 font-semibold">ID</th>
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Jenis Cuti</th>
            <th class="px-4 py-3 font-semibold">Periode</th>
            <th class="px-4 py-3 font-semibold">Durasi</th>
            <th class="px-4 py-3 font-semibold">Keterangan</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Tgl Pengajuan</th>
            <th class="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!leaves.length">
            <td colspan="9" class="px-4 py-8 text-center text-slate-400">
              {{ loading ? "Memuat data…" : "Tidak ada pengajuan." }}
            </td>
          </tr>
          <tr v-for="l in leaves" :key="l.id" class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60">
            <td class="px-4 py-3"><code class="text-xs text-slate-500">{{ l.id }}</code></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary">{{ initials(l.emp) }}</span>
                <span class="font-semibold text-slate-800">{{ l.emp }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-md border border-mahir-border bg-slate-50 px-2 py-1 text-xs text-slate-600">{{ l.type }}</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ l.from }} → {{ l.to }}</td>
            <td class="px-4 py-3 font-bold text-slate-800">{{ l.days }}h</td>
            <td class="px-4 py-3 text-slate-600">{{ l.reason }}</td>
            <td class="px-4 py-3"><StatusBadge :status="l.status" /></td>
            <td class="px-4 py-3 text-slate-600">{{ l.applied }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <template v-if="l.status === 'pending'">
                  <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-success text-white hover:opacity-90" title="Setujui" @click="approve(l.id)">
                    <CheckIcon class="h-4 w-4" />
                  </button>
                  <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-danger text-white hover:opacity-90" title="Tolak" @click="reject(l.id)">
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </template>
                <span v-else class="text-slate-300">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border-t border-mahir-border px-5 py-3 text-[13px] text-mahir-muted">
      {{ leaves.length }} pengajuan
    </div>
  </div>

  <LeaveFormModal v-model:open="modalOpen" @save="handleSave" />
</template>
