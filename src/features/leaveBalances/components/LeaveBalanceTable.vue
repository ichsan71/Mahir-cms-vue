<script setup>
import { UserIcon } from "@heroicons/vue/24/outline";

defineProps({
  balances: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

function num(v) {
  return v === null || v === undefined ? "—" : v;
}

function usedPct(row) {
  const alloc = Number(row?.allocated) || 0;
  const used = Number(row?.used) || 0;
  if (alloc <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((used / alloc) * 100)));
}
</script>

<template>
  <div class="px-5 pb-5">
    <div v-if="loading && !balances.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!balances.length" class="py-10 text-center text-sm text-slate-400">
      Tidak ada saldo cuti yang cocok.
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="row in balances"
        :key="row.id"
        class="rounded-2xl border border-mahir-border bg-white p-4 transition hover:border-mahir-primary/40 hover:shadow-sm"
      >
        <!-- Header kartu -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-[14px] font-semibold text-slate-800">
              {{ row.leaveType?.name || "—" }}
            </div>
            <div class="mt-0.5 flex items-center gap-1 text-[12px] text-mahir-muted">
              <UserIcon class="h-3.5 w-3.5" />
              <span class="truncate">{{ row.employee?.fullName || "—" }}</span>
            </div>
          </div>
          <span
            class="flex-shrink-0 rounded-full bg-mahir-primary-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-primary"
          >
            {{ num(row.year) }}
          </span>
        </div>

        <!-- Sisa saldo -->
        <div class="mt-4 flex items-end justify-between">
          <div>
            <span
              class="text-3xl font-bold leading-none"
              :class="Number(row.remaining) > 0 ? 'text-slate-900' : 'text-slate-400'"
            >
              {{ num(row.remaining) }}
            </span>
            <span class="ml-1 text-[12px] text-slate-400">sisa hari</span>
          </div>
          <span class="text-[12px] text-slate-500">{{ num(row.used) }} / {{ num(row.allocated) }}</span>
        </div>

        <!-- Progress pemakaian -->
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-mahir-primary transition-all"
            :style="{ width: usedPct(row) + '%' }"
          ></div>
        </div>
        <div class="mt-1 text-right text-[11px] text-slate-400">{{ usedPct(row) }}% terpakai</div>
      </div>
    </div>
  </div>
</template>
