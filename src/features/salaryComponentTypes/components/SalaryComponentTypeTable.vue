<script setup>
import { BanknotesIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { categoryLabel, categoryBadgeClass } from "../constants";

defineProps({
  componentTypes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete"]);

const auth = useAuthStore();

const chipCls = "rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600";
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Komponen</th>
          <th class="px-4 py-3 font-semibold">Kategori</th>
          <th class="px-4 py-3 font-semibold">Sifat</th>
          <th class="px-4 py-3 text-center font-semibold">Status</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !componentTypes.length">
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!componentTypes.length">
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">
            Tidak ada komponen yang cocok.
          </td>
        </tr>
        <tr
          v-for="type in componentTypes"
          :key="type.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <BanknotesIcon class="h-5 w-5" />
              </span>
              <div>
                <div class="text-[13.5px] font-semibold text-slate-800">{{ type.name }}</div>
                <div class="text-[12px] text-slate-400">{{ type.code }}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3">
            <span
              class="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium"
              :class="categoryBadgeClass(type.category)"
            >
              {{ categoryLabel(type.category) }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-1">
              <span v-if="type.isTaxable" :class="chipCls">Kena Pajak</span>
              <span v-if="type.isFixed" :class="chipCls">Tetap</span>
              <span v-if="type.isProrated" :class="chipCls">Prorata</span>
              <span v-if="type.forfeitIfLateMinutes" :class="chipCls">
                Hangus &gt; {{ type.forfeitIfLateMinutes }}m telat
              </span>
              <span
                v-if="!type.isTaxable && !type.isFixed && !type.isProrated && !type.forfeitIfLateMinutes"
                class="text-[12px] text-slate-300"
              >
                –
              </span>
            </div>
          </td>
          <td class="px-4 py-3 text-center">
            <span
              class="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium"
              :class="type.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
            >
              {{ type.isActive ? "Aktif" : "Nonaktif" }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
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
