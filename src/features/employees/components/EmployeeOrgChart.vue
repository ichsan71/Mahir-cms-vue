<script setup>
// Bagan struktur organisasi untuk tab "Hirarki" di daftar karyawan.
// Tampilan POHON TERINDENTASI (gaya directory): satu baris per karyawan,
// indentasi menandakan jenjang, buka/tutup per cabang. Terbaca pada ratusan
// karyawan (berbeda dari bagan node-link yang menciut saat di-fit-to-view).
// Data & normalisasi childrenTree memakai composable dashboard yang sudah ada.
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/24/outline";
import { useEmployeeStructure } from "@/features/dashboard/composables/useEmployeeStructure";

const router = useRouter();
const { roots, loading, error, refetch } = useEmployeeStructure();

// --- Pencarian: pangkas pohon, sisakan node cocok + seluruh leluhurnya ---
const query = ref("");
const searchActive = computed(() => query.value.trim().length > 0);

// Set berisi id node yang TERTUTUP. Default: hanya tingkat teratas (root) &
// anak langsungnya yang terbuka; selebihnya tertutup agar tidak membanjiri layar.
const collapsed = ref(null);

// Inisialisasi status tutup sekali, saat data pertama tersedia.
const initialized = ref(false);
function ensureInit(nodes) {
  if (initialized.value || !nodes.length) return;
  const s = new Set();
  const walk = (list, depth) => {
    for (const n of list) {
      const kids = n.children ?? [];
      if (kids.length) {
        if (depth >= 1) s.add(String(n.id)); // tutup mulai cucu ke bawah
        walk(kids, depth + 1);
      }
    }
  };
  walk(nodes, 0);
  collapsed.value = s;
  initialized.value = true;
}

const isCollapsed = (id) =>
  !searchActive.value && (collapsed.value?.has(String(id)) ?? false);

function toggle(id) {
  const s = new Set(collapsed.value ?? []);
  const key = String(id);
  s.has(key) ? s.delete(key) : s.add(key);
  collapsed.value = s;
}
function expandAll() {
  collapsed.value = new Set();
}
function collapseAll() {
  const s = new Set();
  const walk = (nodes) => {
    for (const n of nodes) {
      if ((n.children?.length ?? 0) > 0) {
        s.add(String(n.id));
        walk(n.children);
      }
    }
  };
  walk(roots.value);
  collapsed.value = s;
}

// --- Jumlah total & bawahan (langsung + seluruh keturunan) ---
function descendants(node) {
  let c = 0;
  for (const k of node.children ?? []) c += 1 + descendants(k);
  return c;
}
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

// --- Pencarian: pertahankan node cocok + leluhurnya ---
function filterNodes(nodes, q) {
  const out = [];
  for (const n of nodes) {
    const selfMatch =
      n.name.toLowerCase().includes(q) || (n.code ?? "").toLowerCase().includes(q);
    const kids = filterNodes(n.children ?? [], q);
    if (selfMatch || kids.length) {
      out.push({ ...n, children: selfMatch ? n.children : kids });
    }
  }
  return out;
}

const visibleRoots = computed(() => {
  ensureInit(roots.value);
  if (!searchActive.value) return roots.value;
  return filterNodes(roots.value, query.value.trim().toLowerCase());
});

// --- Ratakan pohon menjadi daftar baris, hormati status tutup ---
// Tiap baris: { id, name, code, units, depth, hasChildren, open, childCount, total }.
const rows = computed(() => {
  const out = [];
  const walk = (nodes, depth) => {
    for (const n of nodes) {
      const kids = n.children ?? [];
      const has = kids.length > 0;
      const open = has && !isCollapsed(n.id);
      out.push({
        id: n.id,
        name: n.name,
        code: n.code,
        units: n.units ?? [],
        depth,
        hasChildren: has,
        open,
        childCount: kids.length,
        total: has ? descendants(n) : 0,
      });
      if (open) walk(kids, depth + 1);
    }
  };
  walk(visibleRoots.value, 0);
  return out;
});

// --- Sorot potongan yang cocok pada nama (tanpa v-html) ---
function segments(text) {
  const q = query.value.trim();
  if (!q) return [{ t: text, hit: false }];
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(ql, i);
    if (idx === -1) {
      parts.push({ t: text.slice(i), hit: false });
      break;
    }
    if (idx > i) parts.push({ t: text.slice(i, idx), hit: false });
    parts.push({ t: text.slice(idx, idx + ql.length), hit: true });
    i = idx + ql.length;
  }
  return parts;
}

function initials(name) {
  return String(name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function openDetail(id) {
  router.push({ name: "karyawan-detail", params: { id } });
}
</script>

<template>
  <div class="rounded-2xl border border-mahir-border bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-3">
      <p class="text-xs text-slate-400">
        <span class="font-semibold text-slate-600">{{ totalCount }}</span> karyawan dalam hierarki
      </p>

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
          class="flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
          @click="expandAll"
        >
          <ChevronDoubleDownIcon class="h-4 w-4" /> Buka semua
        </button>
        <button
          type="button"
          class="flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
          @click="collapseAll"
        >
          <ChevronDoubleRightIcon class="h-4 w-4" /> Tutup semua
        </button>
      </div>
    </div>

    <!-- Konten -->
    <div class="relative min-h-[40vh]">
      <!-- Loading -->
      <div
        v-if="loading && !roots.length"
        class="flex items-center justify-center gap-2 py-24 text-sm text-slate-400"
      >
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat struktur…
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center gap-2 py-24">
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
        v-else-if="!rows.length"
        class="flex items-center justify-center py-24 text-sm text-slate-400"
      >
        {{ searchActive ? "Tidak ada karyawan yang cocok." : "Belum ada data struktur." }}
      </div>

      <!-- Pohon terindentasi -->
      <div v-else class="max-h-[64vh] overflow-auto py-1.5">
        <div
          v-for="r in rows"
          :key="r.id"
          class="group flex cursor-pointer items-center gap-2.5 py-1.5 pr-4 hover:bg-slate-50"
          @click="openDetail(r.id)"
        >
          <!-- Garis indentasi per kedalaman -->
          <span class="flex self-stretch">
            <span
              v-for="d in r.depth"
              :key="d"
              class="relative w-[22px] self-stretch before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-mahir-border"
            ></span>
          </span>

          <!-- Tombol buka/tutup cabang -->
          <button
            v-if="r.hasChildren"
            type="button"
            class="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md text-slate-400 hover:bg-mahir-primary-soft hover:text-mahir-primary"
            :title="r.open ? 'Tutup bawahan' : 'Buka bawahan'"
            @click.stop="toggle(r.id)"
          >
            <ChevronDownIcon v-if="r.open" class="h-4 w-4" />
            <ChevronRightIcon v-else class="h-4 w-4" />
          </button>
          <span v-else class="w-[22px] flex-none"></span>

          <!-- Avatar inisial -->
          <span
            class="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-mahir-primary-soft text-[12.5px] font-semibold text-mahir-primary ring-1 ring-mahir-primary/15"
          >
            {{ initials(r.name) || "?" }}
          </span>

          <!-- Identitas -->
          <span class="flex min-w-0 flex-1 items-center gap-2.5">
            <span class="truncate text-[13.5px] font-semibold text-slate-800">
              <template v-for="(seg, i) in segments(r.name)" :key="i">
                <mark v-if="seg.hit" class="rounded-sm bg-amber-200/70 px-0.5 text-inherit">{{ seg.t }}</mark>
                <template v-else>{{ seg.t }}</template>
              </template>
            </span>
            <span v-if="r.code" class="flex-none font-mono text-[11px] text-slate-400">{{ r.code }}</span>
            <span
              v-if="r.units[0]"
              class="hidden max-w-[9rem] flex-none truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 sm:inline"
            >
              {{ r.units[0].name ?? r.units[0] }}
            </span>
          </span>

          <!-- Jumlah bawahan -->
          <span
            v-if="r.hasChildren"
            class="ml-auto flex-none rounded-full bg-mahir-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-mahir-primary tabular-nums"
          >
            {{ r.childCount }} langsung · {{ r.total }} total
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
