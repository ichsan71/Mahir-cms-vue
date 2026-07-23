<script setup>
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate } from "@/shared/utils/format";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { CalendarDaysIcon, PaperClipIcon, UserCircleIcon, ClockIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/vue/24/outline";

defineProps({
  leaves: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "cancel"]);

const auth = useAuthStore();

function badgeKey(s) {
  return String(s ?? "").toLowerCase();
}

// Draft = belum dikirim untuk persetujuan → bisa di-submit oleh pengaju.
function isDraft(s) {
  return badgeKey(s).includes("draft");
}
function isCancelled(s) {
  const k = badgeKey(s);
  return k.includes("cancel") || k.includes("batal");
}
// Masih bisa dibatalkan selama belum disetujui & belum dibatalkan
// (isApproved dideklarasikan di bawah — function declaration ter-hoist).
function canCancel(s) {
  return !isApproved(s) && !isCancelled(s);
}

// Aksen warna kiri kartu berdasarkan status pengajuan.
function accent(s) {
  const k = badgeKey(s);
  if (k.includes("approve") || k.includes("setuju")) return "bg-mahir-success";
  if (k.includes("reject") || k.includes("tolak")) return "bg-mahir-danger";
  if (k.includes("draft")) return "bg-slate-300";
  if (k.includes("pend") || k.includes("wait") || k.includes("tunggu")) return "bg-mahir-warning";
  return "bg-slate-300";
}

function isApproved(s) {
  const k = badgeKey(s);
  return k.includes("approve") || k.includes("setuju");
}
function isRejected(s) {
  const k = badgeKey(s);
  return k.includes("reject") || k.includes("tolak");
}
function isPending(s) {
  return !isApproved(s) && !isRejected(s);
}

// Warna dot per approver berdasarkan statusnya (pending = kuning).
function dotClass(s) {
  if (isApproved(s)) return "bg-mahir-success";
  if (isRejected(s)) return "bg-mahir-danger";
  return "bg-mahir-warning";
}

function approvedCount(row) {
  return (row?.approvals ?? []).filter((a) => isApproved(a.status)).length;
}

// Approver yang statusnya masih menunggu (untuk ditampilkan eksplisit).
function pendingApprovers(row) {
  return (row?.approvals ?? []).filter((a) => isPending(a.status));
}
function pendingNames(row) {
  return pendingApprovers(row)
    .map((a) => a.approver?.fullName || "—")
    .join(", ");
}
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !leaves.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!leaves.length" class="py-10 text-center text-sm text-slate-400">
      Belum ada pengajuan cuti.
    </div>

    <div v-else class="space-y-2.5">
      <div
        v-for="row in leaves"
        :key="row.id"
        class="flex items-stretch gap-3.5 rounded-xl border border-mahir-border bg-white p-3.5 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Aksen status -->
        <span class="w-1 flex-shrink-0 rounded-full" :class="accent(row.status)"></span>

        <!-- Ikon -->
        <span
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary"
        >
          <CalendarDaysIcon class="h-5 w-5" />
        </span>

        <!-- Info utama -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[14px] font-semibold text-slate-800">{{ row.employee?.fullName || "—" }}</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              {{ row.leaveType?.name || "—" }}
            </span>
          </div>
          <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-slate-500">
            <span class="inline-flex items-center gap-1">
              <CalendarDaysIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ formatDate(row.startDate) }} – {{ formatDate(row.endDate) }}
            </span>
            <span class="text-slate-300">·</span>
            <span>{{ row.totalDays ?? "—" }} hari</span>
          </div>
          <p v-if="row.reason" class="mt-0.5 line-clamp-1 text-[12.5px] text-slate-400">{{ row.reason }}</p>

          <!-- Progres persetujuan -->
          <div v-if="row.approvals?.length" class="mt-1.5 space-y-1">
            <!-- Sedang menunggu approver siapa -->
            <div
              v-if="pendingApprovers(row).length"
              class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-mahir-warning"
            >
              <ClockIcon class="h-3.5 w-3.5" />
              Menunggu: {{ pendingNames(row) }}
            </div>

            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="text-[11.5px] font-medium text-mahir-muted">
                Persetujuan {{ approvedCount(row) }}/{{ row.approvals.length }}
              </span>
              <span
                v-for="a in row.approvals"
                :key="a.id"
                class="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-500"
                :title="a.approver?.fullName"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="dotClass(a.status)"></span>
                <UserCircleIcon class="h-3 w-3" />
                {{ a.approver?.fullName || "—" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Kanan: status + lampiran + aksi kirim -->
        <div class="flex flex-shrink-0 flex-col items-end gap-2">
          <StatusBadge :status="badgeKey(row.status)" />
          <a
            v-if="row.attachment"
            :href="row.attachment"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-[12px] text-mahir-primary hover:underline"
          >
            <PaperClipIcon class="h-3.5 w-3.5" /> Lampiran
          </a>
          <div
            v-if="(canCancel(row.status) && auth.can(PERM.CANCEL)) || (isDraft(row.status) && auth.can(PERM.SUBMIT))"
            class="flex items-center gap-1.5"
          >
            <button
              v-if="canCancel(row.status) && auth.can(PERM.CANCEL)"
              class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
              title="Batalkan pengajuan"
              @click="emit('cancel', row)"
            >
              <XMarkIcon class="h-3.5 w-3.5" /> Batal
            </button>
            <button
              v-if="isDraft(row.status) && auth.can(PERM.SUBMIT)"
              class="inline-flex items-center gap-1 rounded-lg bg-mahir-primary px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-mahir-primary/90"
              title="Kirim untuk persetujuan"
              @click="emit('submit', row)"
            >
              <PaperAirplaneIcon class="h-3.5 w-3.5" /> Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
