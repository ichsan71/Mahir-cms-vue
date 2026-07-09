<script setup>
import { MapPinIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";

defineProps({
  branches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

// Gabungkan nama perusahaan (relasi many) menjadi satu teks.
function companyNames(branch) {
  return (branch.companies ?? []).map((c) => c.name).join(", ") || "—";
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Cabang</th>
          <th class="px-4 py-3 font-semibold">Perusahaan Induk</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !branches.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!branches.length">
          <td colspan="3" class="px-4 py-8 text-center text-slate-400">
            Tidak ada cabang yang cocok.
          </td>
        </tr>
        <tr
          v-for="branch in branches"
          :key="branch.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary"
              >
                <MapPinIcon class="h-5 w-5" />
              </span>
              <div class="text-[13.5px] font-semibold text-slate-800">{{ branch.name }}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ companyNames(branch) }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', branch)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', branch)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', branch)"
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
