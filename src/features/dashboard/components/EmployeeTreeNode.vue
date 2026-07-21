<script setup>
// Simpul pohon struktur organisasi — memanggil dirinya sendiri secara rekursif
// untuk merender bawahan. State buka/tutup dikendalikan container lewat inject
// agar aksi "buka/tutup semua" bisa memengaruhi seluruh cabang.
import { computed, inject } from "vue";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
});

// Controller dari EmployeeStructureCard: { isOpen(id), toggle(id) }.
const tree = inject("empTree");

const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const open = computed(() => tree.isOpen(props.node.id));

// Inisial nama untuk avatar (maks 2 huruf).
const initials = computed(() =>
  String(props.node.name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("")
);

// Warna avatar deterministik berdasarkan id agar konsisten tiap render.
const palette = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const avatarCls = computed(() => palette[Number(props.node.id ?? 0) % palette.length]);
</script>

<template>
  <div>
    <div class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
      <!-- Tombol buka/tutup (atau spacer bila daun) -->
      <button
        v-if="hasChildren"
        type="button"
        class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        @click="tree.toggle(node.id)"
      >
        <ChevronRightIcon class="h-4 w-4 transition-transform" :class="{ 'rotate-90': open }" />
      </button>
      <span v-else class="h-5 w-5 flex-shrink-0"></span>

      <!-- Avatar inisial -->
      <span
        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        :class="avatarCls"
      >
        {{ initials || "?" }}
      </span>

      <!-- Nama + kode + unit -->
      <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span class="truncate text-sm font-medium text-slate-800">{{ node.name }}</span>
        <span v-if="node.code" class="text-xs font-mono text-slate-400">{{ node.code }}</span>
        <span
          v-for="u in node.units"
          :key="u.id"
          class="rounded bg-mahir-primary-soft px-1.5 py-0.5 text-[11px] font-medium text-mahir-primary"
        >
          {{ u.name }}
        </span>
        <span v-if="hasChildren" class="text-[11px] text-slate-400">
          · {{ node.children.length }} bawahan
        </span>
      </div>
    </div>

    <!-- Anak-anak: garis penghubung vertikal + indentasi -->
    <div v-if="hasChildren && open" class="ml-[1.4rem] border-l border-slate-200 pl-3">
      <EmployeeTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>
