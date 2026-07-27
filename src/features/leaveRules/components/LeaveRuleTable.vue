<script setup>
import { CalendarDaysIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

defineProps({
  leaveRules: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

// Angka → teks, "—" bila kosong (0 tetap ditampilkan).
function num(v) {
  return v === null || v === undefined ? "—" : v;
}

// Ringkas ketentuan boolean jadi daftar badge.
function flags(rule) {
  const out = [];
  if (rule.allowHalfDay) out.push("½ hari");
  if (rule.allowCarryForward) out.push("Carry forward");
  if (rule.allowNegativeBalance) out.push("Saldo minus");
  return out;
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Tipe Cuti</th>
          <th class="px-4 py-3 font-semibold">Kuota / Tahun</th>
          <th class="px-4 py-3 font-semibold">Ketentuan</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !leaveRules.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!leaveRules.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">
            Tidak ada aturan cuti yang cocok.
          </td>
        </tr>
        <tr
          v-for="rule in leaveRules"
          :key="rule.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <CalendarDaysIcon class="h-5 w-5" />
              </span>
              <div>
                <div class="text-[13.5px] font-semibold text-slate-800">
                  {{ rule.leaveType?.name || "—" }}
                </div>
                <div class="text-[12px] text-mahir-muted">
                  {{ (rule.companies || []).map((c) => c.name).join(", ") || "—" }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">
            <span class="font-semibold text-slate-800">{{ num(rule.daysPerYear) }}</span> hari
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="f in flags(rule)"
                :key="f"
                class="rounded-full bg-mahir-primary-soft px-2 py-0.5 text-[11px] font-semibold text-mahir-primary"
              >
                {{ f }}
              </span>
              <span v-if="!flags(rule).length" class="text-slate-400">—</span>
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', rule)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', rule)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', rule)"
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
