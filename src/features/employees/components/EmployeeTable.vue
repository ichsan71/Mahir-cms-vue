<script setup>
import { ref, computed, watch } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import ImagePreview from "@/shared/components/ImagePreview.vue";
import { initials, formatDate } from "@/shared/utils/format";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

const props = defineProps({
  employees: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const auth = useAuthStore();

const selected = ref([]);

// Lightbox foto karyawan.
const preview = ref({ open: false, src: "", alt: "" });
function openPreview(emp) {
  if (!emp.image) return;
  preview.value = { open: true, src: emp.image, alt: emp.fullName };
}

const allChecked = computed(
  () => props.employees.length > 0 && selected.value.length === props.employees.length,
);

function toggleAll(e) {
  selected.value = e.target.checked ? props.employees.map((emp) => emp.id) : [];
}

// Gabungkan nama unit (relasi many) menjadi satu teks.
function unitNames(emp) {
  return (emp.units ?? []).map((u) => u.name).join(", ") || "—";
}

// Bersihkan seleksi yang sudah tidak ada di hasil filter terbaru
watch(
  () => props.employees,
  (list) => {
    const ids = new Set(list.map((e) => e.id));
    selected.value = selected.value.filter((id) => ids.has(id));
  },
);
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="w-10 px-4 py-3">
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :checked="allChecked"
              @change="toggleAll"
            />
          </th>
          <th class="px-4 py-3 font-semibold">Karyawan</th>
          <th class="px-4 py-3 font-semibold">Unit</th>
          <th class="px-4 py-3 font-semibold">Level</th>
          <th class="px-4 py-3 font-semibold">Tanggal Masuk</th>
          <th class="px-4 py-3 font-semibold">Status</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !employees.length">
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!employees.length">
          <td colspan="7" class="px-4 py-8 text-center text-slate-400">
            Tidak ada karyawan yang cocok.
          </td>
        </tr>
        <tr
          v-for="emp in employees"
          :key="emp.id"
          class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
        >
          <td class="px-4 py-3">
            <input
              v-model="selected"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :value="emp.id"
            />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                :class="emp.image ? 'cursor-zoom-in ring-1 ring-transparent hover:ring-mahir-primary' : ''"
                @click="openPreview(emp)"
              >
                <img
                  v-if="emp.image"
                  :src="emp.image"
                  :alt="emp.fullName"
                  class="h-full w-full object-cover"
                />
                <template v-else>{{ initials(emp.fullName) }}</template>
              </span>
              <div>
                <div class="text-[13.5px] font-semibold text-slate-800">{{ emp.fullName }}</div>
                <div v-if="auth.can(PERM.REGISTER)" class="text-[11.5px] text-slate-400">NIK: {{ emp.nik || "—" }}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ unitNames(emp) }}</td>
          <td class="px-4 py-3 text-slate-600">{{ emp.level?.name ?? "—" }}</td>
          <td class="px-4 py-3 text-slate-600">{{ formatDate(emp.hiredDate) }}</td>
          <td class="px-4 py-3">
            <StatusBadge :status="emp.user?.isActive ? 'active' : 'inactive'" />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', emp)"
              >
                <EyeIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.EDIT)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', emp)"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="auth.can(PERM.DELETE)"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="emit('delete', emp)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <ImagePreview
      v-model:open="preview.open"
      :src="preview.src"
      :alt="preview.alt"
    />
  </div>
</template>
