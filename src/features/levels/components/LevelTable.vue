<script setup>
import { ChartBarIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

defineProps({
  levels: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Level</th>
          <th class="px-4 py-3 font-semibold">Induk</th>
          <th class="px-4 py-3 font-semibold">Sub Level</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !levels.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!levels.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">
            Tidak ada level yang cocok.
          </td>
        </tr>
        <tr
          v-for="level in levels"
          :key="level.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <ChartBarIcon class="h-5 w-5" />
              </span>
              <div class="text-[13.5px] font-semibold text-slate-800">{{ level.name }}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ level.parent?.name ?? "—" }}</td>
          <td class="px-4 py-3 text-slate-600">
            <span
              v-if="level.childrens?.length"
              class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {{ level.childrens.length }} sub level
            </span>
            <span v-else>—</span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', level)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', level)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', level)"
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
