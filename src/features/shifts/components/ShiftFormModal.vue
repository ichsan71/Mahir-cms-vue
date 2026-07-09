<script setup>
// Form tambah/ubah shift — kontrak ShiftInput (name, startDay, endDay, startTime, endTime).
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Shift yang sedang diubah (diprefill langsung dari baris list). null = mode tambah.
  shift: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.shift?.id);

// Pilihan hari dari enum backend (DayChoices) — reusable.
const { options: dayOptions, loading: dayLoading } = useEnumChoices("DayChoices");

const blank = () => ({
  name: "",
  startDay: "",
  endDay: "",
  startTime: "",
  endTime: "",
});

const form = ref(blank());

// Normalisasi jam ke "HH:MM" agar cocok dengan input type="time".
function toHHMM(t) {
  return t ? String(t).slice(0, 5) : "";
}

function fillForm() {
  const s = props.shift;
  form.value = s?.id
    ? {
        name: s.name ?? "",
        startDay: s.startDay ?? "",
        endDay: s.endDay ?? "",
        startTime: toHHMM(s.startTime),
        endTime: toHHMM(s.endTime),
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.shift,
  () => props.open && fillForm(),
);

function onSubmit() {
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    startDay: f.startDay || null,
    endDay: f.endDay || null,
    startTime: f.startTime || null,
    endTime: f.endTime || null,
  };
  emit("save", { id: props.shift?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Shift' : 'Tambah Shift'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <label :class="labelCls">Nama Shift *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>

      <div>
        <label :class="labelCls">Hari Mulai *</label>
        <select v-model="form.startDay" required :disabled="dayLoading" :class="fieldCls">
          <option value="">{{ dayLoading ? "Memuat…" : "Pilih hari" }}</option>
          <option v-for="d in dayOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
      <div>
        <label :class="labelCls">Hari Selesai *</label>
        <select v-model="form.endDay" required :disabled="dayLoading" :class="fieldCls">
          <option value="">{{ dayLoading ? "Memuat…" : "Pilih hari" }}</option>
          <option v-for="d in dayOptions" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>

      <div>
        <label :class="labelCls">Jam Mulai *</label>
        <input v-model="form.startTime" type="time" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Jam Selesai *</label>
        <input v-model="form.endTime" type="time" required :class="fieldCls" />
      </div>
    </div>
  </BaseModal>
</template>
