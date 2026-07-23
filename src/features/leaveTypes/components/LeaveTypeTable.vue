<script setup>
import { TagIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

defineProps({
  leaveTypes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

function ruleCount(type) {
  return (type?.rules ?? []).length;
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Tipe Cuti</th>
          <th class="px-4 py-3 font-semibold">Aturan Terkait</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !leaveTypes.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!leaveTypes.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">
            Tidak ada tipe cuti yang cocok.
          </td>
        </tr>
        <tr
          v-for="type in leaveTypes"
          :key="type.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <TagIcon class="h-5 w-5" />
              </span>
              <div class="text-[13.5px] font-semibold text-slate-800">{{ type.name }}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">
            <span class="font-semibold text-slate-800">{{ ruleCount(type) }}</span> aturan
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', type)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', type)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', type)"
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
