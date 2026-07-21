<script setup>
// Kartu struktur organisasi untuk dashboard: pohon karyawan (atasan → bawahan)
// dengan pencarian & aksi buka/tutup semua. Data & normalisasi dari composable;
// render node memakai EmployeeTreeNode (rekursif).
import { computed, provide, ref } from "vue";
import {
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import { useEmployeeStructure } from "../composables/useEmployeeStructure";
import EmployeeTreeNode from "./EmployeeTreeNode.vue";

const { roots, loading, error, refetch } = useEmployeeStructure();

// --- Pencarian: pangkas pohon, sisakan node yang cocok + seluruh leluhurnya ---
const query = ref("");
const searchActive = computed(() => query.value.trim().length > 0);

function filterNodes(nodes, q) {
  const out = [];
  for (const n of nodes) {
    const selfMatch = n.name.toLowerCase().includes(q) || (n.code ?? "").toLowerCase().includes(q);
    const kids = filterNodes(n.children ?? [], q);
    // Node ditampilkan bila cocok sendiri, atau punya keturunan yang cocok.
    if (selfMatch || kids.length) {
      out.push({ ...n, children: selfMatch ? n.children : kids });
    }
  }
  return out;
}

const visibleRoots = computed(() => {
  if (!searchActive.value) return roots.value;
  return filterNodes(roots.value, query.value.trim().toLowerCase());
});

// --- Kumpulkan semua id (untuk aksi tutup semua) ---
function collectIds(nodes, acc = []) {
  for (const n of nodes) {
    acc.push(n.id);
    collectIds(n.children ?? [], acc);
  }
  return acc;
}
const totalCount = computed(() => collectIds(roots.value).length);

// --- State buka/tutup, dikendalikan container & dibagikan ke node via inject ---
// openState[id] === false berarti tertutup; default (undefined) = terbuka.
const openState = ref({});

function isOpen(id) {
  // Saat mencari, paksa semua cabang terbuka agar hasil selalu terlihat.
  if (searchActive.value) return true;
  return openState.value[id] !== false;
}
function toggle(id) {
  openState.value = { ...openState.value, [id]: openState.value[id] === false };
}
function expandAll() {
  openState.value = {};
}
function collapseAll() {
  const map = {};
  for (const id of collectIds(roots.value)) map[id] = false;
  openState.value = map;
}

provide("empTree", { isOpen, toggle });
</script>

<template>
  <div class="rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary">
          <UsersIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Struktur Organisasi</h2>
          <p class="text-xs text-slate-400">{{ totalCount }} karyawan dalam hierarki</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="query"
            type="text"
            placeholder="Cari nama / kode…"
            class="w-48 rounded-lg border border-mahir-border py-1.5 pl-8 pr-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
        <button
          type="button"
          title="Buka semua"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-mahir-border text-slate-500 hover:bg-slate-50"
          @click="expandAll"
        >
          <ArrowsPointingOutIcon class="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Tutup semua"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-mahir-border text-slate-500 hover:bg-slate-50"
          @click="collapseAll"
        >
          <ArrowsPointingInIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="max-h-[65vh] overflow-y-auto px-3 py-3">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat struktur…
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-16 text-center">
        <p class="text-sm text-rose-500">Gagal memuat struktur organisasi.</p>
        <button
          type="button"
          class="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          @click="refetch()"
        >
          Coba lagi
        </button>
      </div>

      <!-- Kosong / tak ada hasil -->
      <div v-else-if="!visibleRoots.length" class="py-16 text-center text-sm text-slate-400">
        {{ searchActive ? "Tidak ada karyawan yang cocok." : "Belum ada data struktur." }}
      </div>

      <!-- Pohon -->
      <div v-else class="space-y-0.5">
        <EmployeeTreeNode v-for="root in visibleRoots" :key="root.id" :node="root" />
      </div>
    </div>
  </div>
</template>
