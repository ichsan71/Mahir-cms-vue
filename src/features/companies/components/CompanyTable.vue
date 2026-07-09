<script setup>
import { initials } from "@/shared/utils/format";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";

defineProps({
  companies: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Perusahaan</th>
          <th class="px-4 py-3 font-semibold">NPWP</th>
          <th class="px-4 py-3 font-semibold">Telepon</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !companies.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!companies.length">
          <td colspan="4" class="px-4 py-8 text-center text-slate-400">
            Tidak ada perusahaan yang cocok.
          </td>
        </tr>
        <tr
          v-for="company in companies"
          :key="company.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <img
                v-if="company.logo"
                :src="company.logo"
                :alt="company.name"
                class="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
              />
              <span
                v-else
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                >{{ initials(company.name) }}</span
              >
              <div class="text-[13.5px] font-semibold text-slate-800">{{ company.name }}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ company.npwp || "—" }}</td>
          <td class="px-4 py-3 text-slate-600">{{ company.phone || "—" }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', company)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', company)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', company)"
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
