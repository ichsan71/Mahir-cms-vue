<script setup>
import { computed } from "vue";
import { CalendarDaysIcon, AdjustmentsHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import WorkPatternWeekStrip from "./WorkPatternWeekStrip.vue";

defineProps({
  workPatterns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

// Hitung jumlah hari kerja untuk subjudul tiap pola.
function workdayCount(pattern) {
  return (pattern?.details ?? []).filter((d) => d.isWorkday).length;
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Pola Kerja</th>
          <th class="px-4 py-3 font-semibold">Jadwal Mingguan</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !workPatterns.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!workPatterns.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">
            Tidak ada pola kerja yang cocok.
          </td>
        </tr>
        <tr
          v-for="pattern in workPatterns"
          :key="pattern.id"
          class="border-b border-mahir-border last:border-0 align-top hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <CalendarDaysIcon class="h-5 w-5" />
              </span>
              <div>
                <div class="text-[13.5px] font-semibold text-slate-800">{{ pattern.name }}</div>
                <div class="text-[12px] text-mahir-muted">{{ workdayCount(pattern) }} hari kerja</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3">
            <WorkPatternWeekStrip :details="pattern.details" />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Atur Jadwal"
                @click="emit('detail', pattern)"
              >
                <AdjustmentsHorizontalIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', pattern)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', pattern)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
