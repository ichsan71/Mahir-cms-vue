<script setup>
// Custom node Vue Flow untuk bagan struktur organisasi.
// Handle atas/bawah dibutuhkan agar edge tersambung; disembunyikan lewat CSS.
import { computed, inject } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  id: { type: String, required: true },
  data: { type: Object, required: true },
});

// Controller dari EmployeeOrgChart: { toggle(id) }.
const ctrl = inject("empOrgChart");

const hasChildren = computed(() => (props.data.childCount ?? 0) > 0);

const initials = computed(() =>
  String(props.data.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join(""),
);

// Palet senada tema (biru/indigo + aksen), dipilih deterministik per node.
// Tiap varian: tint kartu + warna aksen bar + warna avatar yang seirama.
const palettes = [
  { card: "bg-indigo-50 border-indigo-200", bar: "bg-indigo-500", avatar: "bg-indigo-100 text-indigo-700" },
  { card: "bg-blue-50 border-blue-200", bar: "bg-blue-500", avatar: "bg-blue-100 text-blue-700" },
  { card: "bg-sky-50 border-sky-200", bar: "bg-sky-500", avatar: "bg-sky-100 text-sky-700" },
  { card: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", avatar: "bg-emerald-100 text-emerald-700" },
  { card: "bg-violet-50 border-violet-200", bar: "bg-violet-500", avatar: "bg-violet-100 text-violet-700" },
  { card: "bg-amber-50 border-amber-200", bar: "bg-amber-500", avatar: "bg-amber-100 text-amber-700" },
];
const theme = computed(() => palettes[Number(props.id ?? 0) % palettes.length]);
</script>

<template>
  <div
    class="relative flex w-48 items-center gap-2 overflow-hidden rounded-xl border pl-4 pr-3 py-2 shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:shadow-md"
    :class="[theme.card, { 'opacity-70': data.collapsed }]"
  >
    <!-- Aksen bar berwarna di tepi kiri -->
    <span class="absolute inset-y-0 left-0 w-1.5" :class="theme.bar"></span>

    <Handle type="target" :position="Position.Top" :connectable="false" />

    <span
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-inner"
      :class="theme.avatar"
    >
      {{ initials || "?" }}
    </span>

    <div class="min-w-0 flex-1 text-left">
      <p class="truncate text-sm font-semibold text-slate-800">{{ data.name }}</p>
      <p v-if="data.code" class="truncate font-mono text-[11px] text-slate-500">{{ data.code }}</p>
      <div v-if="data.units?.length" class="mt-0.5 flex flex-wrap gap-1">
        <span
          v-for="u in data.units.slice(0, 2)"
          :key="u.id"
          class="max-w-[6rem] truncate rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-black/5"
        >
          {{ u.name }}
        </span>
        <span v-if="data.units.length > 2" class="text-[10px] text-slate-500">
          +{{ data.units.length - 2 }}
        </span>
      </div>
    </div>

    <!-- Tombol buka/tutup + jumlah bawahan -->
    <button
      v-if="hasChildren"
      type="button"
      :title="data.collapsed ? 'Buka bawahan' : 'Tutup bawahan'"
      class="flex flex-shrink-0 items-center gap-0.5 rounded-md bg-white/70 px-1.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-black/5 hover:bg-white"
      @click.stop="ctrl.toggle(id)"
    >
      {{ data.childCount }}
      <ChevronDownIcon class="h-3 w-3 transition-transform" :class="{ '-rotate-90': data.collapsed }" />
    </button>

    <Handle type="source" :position="Position.Bottom" :connectable="false" />
  </div>
</template>
