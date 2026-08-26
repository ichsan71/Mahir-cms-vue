<script setup>
// Bagan struktur organisasi (top-down) untuk tab "Hirarki" di daftar karyawan.
// Data & normalisasi childrenTree memakai composable dashboard yang sudah ada.
// Render pakai Vue Flow (pan/zoom/minimap/controls) + auto-layout hierarki dagre.
import { computed, nextTick, provide, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { VueFlow, useVueFlow, Position } from "@vue-flow/core";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import dagre from "@dagrejs/dagre";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import { useEmployeeStructure } from "@/features/dashboard/composables/useEmployeeStructure";
import OrgNodeCard from "./OrgNodeCard.vue";

import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";

const NODE_W = 192;
const NODE_H = 92;

const router = useRouter();
const { roots, loading, error, refetch } = useEmployeeStructure();
const { setNodes, setEdges, fitView, onNodeClick } = useVueFlow();

// --- Pencarian: pangkas pohon, sisakan node yang cocok + seluruh leluhurnya ---
const query = ref("");
const searchActive = computed(() => query.value.trim().length > 0);

function filterNodes(nodes, q) {
  const out = [];
  for (const n of nodes) {
    const selfMatch = n.name.toLowerCase().includes(q) || (n.code ?? "").toLowerCase().includes(q);
    const kids = filterNodes(n.children ?? [], q);
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

// --- State buka/tutup (set berisi id yang tertutup) ---
const collapsed = ref(new Set());
// Saat mencari, abaikan status tutup agar semua hasil tampak.
const isCollapsed = (id) => !searchActive.value && collapsed.value.has(id);

function toggle(id) {
  const s = new Set(collapsed.value);
  s.has(id) ? s.delete(id) : s.add(id);
  collapsed.value = s;
}
function expandAll() {
  collapsed.value = new Set();
}
function collapseAll() {
  const s = new Set();
  const walk = (nodes) => {
    for (const n of nodes) {
      if ((n.children?.length ?? 0) > 0) s.add(String(n.id));
      walk(n.children ?? []);
    }
  };
  walk(roots.value);
  collapsed.value = s;
}

provide("empOrgChart", { toggle });

const totalCount = computed(() => {
  let c = 0;
  const walk = (nodes) => {
    for (const n of nodes) {
      c += 1;
      walk(n.children ?? []);
    }
  };
  walk(roots.value);
  return c;
});

// --- Bangun daftar node + edge dari pohon, hormati status tutup ---
function buildGraph(treeRoots) {
  const nodes = [];
  const edges = [];
  const walk = (node, parentId) => {
    const id = String(node.id);
    const kids = node.children ?? [];
    const collapsedHere = isCollapsed(id) && kids.length > 0;
    nodes.push({
      id,
      type: "org",
      position: { x: 0, y: 0 },
      data: {
        name: node.name,
        code: node.code,
        units: node.units ?? [],
        childCount: kids.length,
        collapsed: collapsedHere,
      },
    });
    if (parentId) {
      edges.push({
        id: `${parentId}->${id}`,
        source: parentId,
        target: id,
        type: "smoothstep",
        style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
      });
    }
    if (!collapsedHere) {
      for (const k of kids) walk(k, id);
    }
  };
  for (const r of treeRoots) walk(r, null);
  return { nodes, edges };
}

// --- Auto-layout hierarki top-down memakai dagre ---
function layout(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 36, ranksep: 64, marginx: 20, marginy: 20 });
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });
}

function refresh() {
  const { nodes, edges } = buildGraph(visibleRoots.value);
  setNodes(layout(nodes, edges));
  setEdges(edges);
  nextTick(() => fitView({ padding: 0.2 }));
}

// Rebuild saat data, pencarian, atau status tutup berubah.
watch([visibleRoots, collapsed], refresh, { deep: false, immediate: true });

onNodeClick(({ node }) => {
  router.push({ name: "karyawan-detail", params: { id: node.id } });
});
</script>

<template>
  <div class="rounded-2xl border border-mahir-border bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-3">
      <p class="text-xs text-slate-400">{{ totalCount }} karyawan dalam hierarki</p>

      <div class="flex flex-wrap items-center gap-2">
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

    <!-- Kanvas -->
    <div class="relative h-[68vh] w-full">
      <!-- Loading -->
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/70 text-sm text-slate-400"
      >
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat struktur…
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/70"
      >
        <p class="text-sm text-rose-500">Gagal memuat struktur organisasi.</p>
        <button
          type="button"
          class="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          @click="refetch()"
        >
          Coba lagi
        </button>
      </div>

      <!-- Kosong -->
      <div
        v-else-if="!visibleRoots.length"
        class="absolute inset-0 z-10 flex items-center justify-center text-sm text-slate-400"
      >
        {{ searchActive ? "Tidak ada karyawan yang cocok." : "Belum ada data struktur." }}
      </div>

      <VueFlow
        :min-zoom="0.2"
        :max-zoom="2"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="true"
        fit-view-on-init
        class="rounded-b-2xl"
      >
        <template #node-org="nodeProps">
          <OrgNodeCard :id="nodeProps.id" :data="nodeProps.data" />
        </template>

        <Controls :show-interactive="false" />
        <MiniMap pannable zoomable />
      </VueFlow>
    </div>
  </div>
</template>

<style scoped>
/* Sembunyikan titik handle bawaan (dibutuhkan untuk edge, tapi tak perlu terlihat) */
:deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
/* Kartu node kita punya border sendiri; matikan gaya default node Vue Flow */
:deep(.vue-flow__node-org) {
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
  cursor: pointer;
}
:deep(.vue-flow__node-org.selected) {
  outline: none;
}
</style>
