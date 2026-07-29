<script setup>
import { ref } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate, initials } from "@/shared/utils/format";
import {
  ChevronRightIcon,
  UsersIcon,
  IdentificationIcon,
  BuildingOffice2Icon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  histories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

// Snapshot yang sedang di-expand (berisi id).
const expanded = ref(new Set());
function toggle(id) {
  const next = new Set(expanded.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expanded.value = next;
}
const isExpanded = (id) => expanded.value.has(id);

// Nama hari singkat dari tanggal, mis. "Jumat".
function weekday(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(d);
}

// Nama unit tergabung, mis. "Finance, HRD". Kosong → "—".
function unitNames(emp) {
  const names = (emp.units || []).map((u) => u?.name).filter(Boolean);
  return names.length ? names.join(", ") : "—";
}
</script>

<template>
  <div class="px-5 pb-5">
    <div v-if="loading && !histories.length" class="py-12 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!histories.length" class="py-12 text-center text-sm text-slate-400">
      Tidak ada riwayat kehadiran yang cocok.
    </div>

    <div v-else class="flex flex-col gap-2.5">
      <div
        v-for="h in histories"
        :key="h.id"
        class="overflow-hidden rounded-xl border border-mahir-border bg-white transition hover:border-mahir-primary/40"
      >
        <!-- Ringkasan snapshot -->
        <button
          type="button"
          class="flex w-full items-center gap-4 px-4 py-3 text-left"
          @click="toggle(h.id)"
        >
          <ChevronRightIcon
            class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform"
            :class="{ 'rotate-90': isExpanded(h.id) }"
          />

          <!-- Tanggal snapshot -->
          <div class="w-[150px] flex-shrink-0">
            <div class="text-[13.5px] font-semibold text-slate-800">{{ formatDate(h.snapshotDate) }}</div>
            <div class="text-[11.5px] text-slate-400">{{ weekday(h.snapshotDate) }}</div>
          </div>

          <!-- Jumlah karyawan -->
          <div class="flex flex-1 items-center gap-2 text-slate-600">
            <UsersIcon class="h-4 w-4 text-slate-400" />
            <span class="text-[13px] font-medium">{{ h.employeeCount ?? (h.employees || []).length }} karyawan</span>
          </div>

          <!-- Status -->
          <div class="flex-shrink-0">
            <StatusBadge :status="String(h.status ?? '').toLowerCase()" />
          </div>
        </button>

        <!-- Detail karyawan (expand) -->
        <div v-if="isExpanded(h.id)" class="border-t border-mahir-border bg-slate-50/70 px-4 py-4">
          <div class="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Karyawan ({{ (h.employees || []).length }})
          </div>

          <div v-if="!h.employees?.length" class="py-3 text-center text-[13px] text-slate-400">
            Tidak ada karyawan pada snapshot ini.
          </div>

          <div v-else class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="emp in h.employees"
              :key="emp.id"
              class="flex items-start gap-3 rounded-lg border border-mahir-border bg-white p-3"
            >
              <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary">
                {{ initials(emp.fullName) || "?" }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="truncate text-[13.5px] font-semibold text-slate-800">
                    {{ emp.fullName || "—" }}
                  </span>
                  <span
                    v-if="emp.level?.name"
                    class="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-slate-500"
                  >
                    {{ emp.level.name }}
                  </span>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                  <span v-if="emp.nik" class="inline-flex items-center gap-1">
                    <IdentificationIcon class="h-3.5 w-3.5 text-slate-400" />
                    {{ emp.nik }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <BuildingOffice2Icon class="h-3.5 w-3.5 text-slate-400" />
                    {{ unitNames(emp) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
