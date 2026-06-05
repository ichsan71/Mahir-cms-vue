<script setup>
// Port dari modules/employees.js (renderRows + select-all)
import { ref, computed, watch } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { initials } from "@/shared/utils/format";

const props = defineProps({
  employees: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["detail", "edit", "delete"]);

const selected = ref([]);

const allChecked = computed(
  () => props.employees.length > 0 && selected.value.length === props.employees.length,
);

function toggleAll(e) {
  selected.value = e.target.checked ? props.employees.map((emp) => emp.id) : [];
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
          <th class="px-4 py-3 font-semibold">NIP / ID</th>
          <th class="px-4 py-3 font-semibold">Departemen</th>
          <th class="px-4 py-3 font-semibold">Jabatan</th>
          <th class="px-4 py-3 font-semibold">Bergabung</th>
          <th class="px-4 py-3 font-semibold">Status</th>
          <th class="px-4 py-3 text-center font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && !employees.length">
          <td colspan="8" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
        </tr>
        <tr v-else-if="!employees.length">
          <td colspan="8" class="px-4 py-8 text-center text-slate-400">
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
                class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                >{{ initials(emp.name) }}</span
              >
              <div>
                <div class="text-[13.5px] font-semibold text-slate-800">{{ emp.name }}</div>
                <div class="text-[11.5px] text-slate-400">{{ emp.email }}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ emp.id }}</td>
          <td class="px-4 py-3 text-slate-600">{{ emp.dept }}</td>
          <td class="px-4 py-3 text-slate-600">{{ emp.position }}</td>
          <td class="px-4 py-3 text-slate-600">{{ emp.join }}</td>
          <td class="px-4 py-3"><StatusBadge :status="emp.status" /></td>
          <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Detail"
                @click="emit('detail', emp)"
              >
                <i class="bi bi-eye"></i>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="emit('edit', emp)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-mahir-danger hover:bg-mahir-danger-soft"
                title="Hapus"
                @click="emit('delete', emp)"
              >
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
