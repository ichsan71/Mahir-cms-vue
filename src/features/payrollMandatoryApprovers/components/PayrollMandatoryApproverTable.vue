<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import {
  BuildingOffice2Icon,
  ShareIcon,
  UserIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  approvers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete"]);

const auth = useAuthStore();

// Kelompokkan approver per perusahaan — satu kartu per company, berisi daftar
// approver yang sudah urut `order` (urutan dari props dipertahankan).
const groups = computed(() => {
  const map = new Map();
  for (const row of props.approvers) {
    const key = row.company?.id ?? "none";
    if (!map.has(key)) {
      map.set(key, { key, company: row.company ?? null, rows: [] });
    }
    map.get(key).rows.push(row);
  }
  return [...map.values()];
});
</script>

<template>
  <div class="px-5 pb-4">
    <div v-if="loading && !approvers.length" class="py-10 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!approvers.length" class="py-10 text-center text-sm text-slate-400">
      Belum ada approver wajib penggajian yang cocok.
    </div>

    <div v-else class="space-y-4">
      <!-- Satu kartu per perusahaan -->
      <div
        v-for="g in groups"
        :key="g.key"
        class="overflow-hidden rounded-xl border border-mahir-border"
      >
        <!-- Header perusahaan -->
        <div class="flex items-center gap-2 border-b border-mahir-border bg-slate-50/70 px-4 py-2.5">
          <BuildingOffice2Icon class="h-4 w-4 flex-shrink-0 text-mahir-primary" />
          <span class="truncate text-[14px] font-semibold text-slate-800">
            {{ g.company?.name || "Tanpa perusahaan" }}
          </span>
          <span class="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {{ g.rows.length }} approver
          </span>
        </div>

        <!-- Daftar approver (urut order) -->
        <ul class="divide-y divide-mahir-border">
          <li
            v-for="row in g.rows"
            :key="row.id"
            class="group flex items-center gap-3.5 px-4 py-3 transition hover:bg-slate-50/60"
          >
            <!-- Urutan (langkah) -->
            <span
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary text-[13px] font-bold text-white shadow-inner"
            >
              {{ row.order ?? "—" }}
            </span>

            <!-- Approver & unit -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-800">
                <UserIcon class="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span class="truncate">{{ row.employee?.fullName || "Belum ada approver" }}</span>
              </div>
              <div class="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-mahir-muted">
                <ShareIcon class="h-3.5 w-3.5 flex-shrink-0" />
                <span class="truncate">{{ row.unit?.name || "Semua unit" }}</span>
              </div>
            </div>

            <!-- Aksi -->
            <div
              v-if="auth.can(PERM.EDIT) || auth.can(PERM.DELETE)"
              class="flex flex-shrink-0 items-center gap-1"
            >
              <button
                v-if="auth.can(PERM.EDIT)"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-mahir-primary-soft hover:text-mahir-primary"
                title="Ubah"
                @click="emit('edit', row)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-mahir-danger-soft hover:text-mahir-danger"
                title="Hapus"
                @click="emit('delete', row)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
