<script setup>
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate } from "@/shared/utils/format";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { CalendarDaysIcon, PaperClipIcon, UserCircleIcon, CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";

defineProps({
  approvals: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["approve", "reject"]);

const auth = useAuthStore();

function badgeKey(s) {
  return String(s ?? "").toLowerCase();
}

// Masih menunggu keputusan approver → tampilkan tombol setujui/tolak.
function isPending(s) {
  const k = badgeKey(s);
  return !(k.includes("approve") || k.includes("setuju") || k.includes("reject") || k.includes("tolak"));
}

// Aksen warna kiri kartu berdasarkan status persetujuan.
function accent(s) {
  const k = badgeKey(s);
  if (k.includes("approve") || k.includes("setuju")) return "bg-mahir-success";
  if (k.includes("reject") || k.includes("tolak")) return "bg-mahir-danger";
  if (k.includes("pend") || k.includes("wait") || k.includes("tunggu")) return "bg-mahir-warning";
  return "bg-slate-300";
}
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !approvals.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!approvals.length" class="py-10 text-center text-sm text-slate-400">
      Tidak ada pengajuan yang cocok.
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="row in approvals"
        :key="row.id"
        class="group flex items-stretch gap-3.5 overflow-hidden rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Aksen status -->
        <span class="w-1 flex-shrink-0 rounded-full" :class="accent(row.status)"></span>

        <!-- Ikon periode -->
        <span
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary"
        >
          <CalendarDaysIcon class="h-5 w-5" />
        </span>

        <!-- Info utama -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[14px] font-semibold text-slate-800">
              {{ row.leave?.employee?.fullName || "—" }}
            </span>
            <span
              v-if="row.leave?.leaveType?.name"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
            >
              {{ row.leave.leaveType.name }}
            </span>
          </div>
          <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-slate-500">
            <span class="inline-flex items-center gap-1">
              <CalendarDaysIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ formatDate(row.leave?.startDate) }} – {{ formatDate(row.leave?.endDate) }}
            </span>
            <span class="text-slate-300">·</span>
            <span>{{ row.leave?.totalDays ?? "—" }} hari</span>
          </div>
          <p v-if="row.leave?.reason" class="mt-0.5 line-clamp-1 text-[12.5px] text-slate-400">
            {{ row.leave.reason }}
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-mahir-muted">
            <span class="inline-flex items-center gap-1">
              <UserCircleIcon class="h-3.5 w-3.5" />
              Approver: {{ row.approver?.fullName || "—" }}
              <span v-if="row.approver?.level?.name" class="text-slate-400"
                >· {{ row.approver.level.name }}</span
              >
            </span>
            <a
              v-if="row.leave?.attachment"
              :href="row.leave.attachment"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 text-mahir-primary hover:underline"
            >
              <PaperClipIcon class="h-3.5 w-3.5" /> Lampiran
            </a>
          </div>
        </div>

        <!-- Status + aksi -->
        <div class="flex flex-shrink-0 flex-col items-end gap-2">
          <StatusBadge :status="badgeKey(row.status)" />
          <div
            v-if="isPending(row.status) && (auth.can(PERM.APPROVE) || auth.can(PERM.REJECT))"
            class="flex items-center gap-1.5"
          >
            <button
              v-if="auth.can(PERM.REJECT)"
              class="inline-flex items-center gap-1 rounded-lg border border-mahir-danger/30 px-2.5 py-1 text-[12px] font-semibold text-mahir-danger hover:bg-mahir-danger-soft"
              title="Tolak"
              @click="emit('reject', row)"
            >
              <XMarkIcon class="h-3.5 w-3.5" /> Tolak
            </button>
            <button
              v-if="auth.can(PERM.APPROVE)"
              class="inline-flex items-center gap-1 rounded-lg bg-mahir-success px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-mahir-success/90"
              title="Setujui"
              @click="emit('approve', row)"
            >
              <CheckIcon class="h-3.5 w-3.5" /> Setujui
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
