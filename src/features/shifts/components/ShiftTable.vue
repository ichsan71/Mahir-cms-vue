<script setup>
import { prettyEnum } from "@/shared/composables/useEnumChoices";
import { ClockIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

defineProps({
  shifts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

// Tampilkan jam ringkas "HH:MM" (buang detik bila ada).
function fmtTime(t) {
  if (!t) return "—";
  return String(t).slice(0, 5);
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Shift</th>
          <th class="px-4 py-3 font-semibold">Hari</th>
          <th class="px-4 py-3 font-semibold">Waktu</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !shifts.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!shifts.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">
            Tidak ada shift yang cocok.
          </td>
        </tr>
        <tr
          v-for="shift in shifts"
          :key="shift.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <ClockIcon class="h-5 w-5" />
              </span>
              <div class="text-[13.5px] font-semibold text-slate-800">{{ shift.name }}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">
            {{ prettyEnum(shift.startDay) || "—" }} – {{ prettyEnum(shift.endDay) || "—" }}
          </td>
          <td class="px-4 py-3 text-slate-600">
            <span class="font-mono">{{ fmtTime(shift.startTime) }} – {{ fmtTime(shift.endTime) }}</span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', shift)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', shift)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', shift)"
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
