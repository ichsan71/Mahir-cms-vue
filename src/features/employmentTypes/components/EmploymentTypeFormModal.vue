<script setup>
// Form tambah/ubah tipe kepegawaian — kontrak EmploymentTypeInput (name).
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Tipe yang sedang diubah. null = mode tambah. (name diambil dari baris list)
  employmentType: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.employmentType?.id);

const form = ref({ name: "" });

function fillForm() {
  form.value = { name: props.employmentType?.name ?? "" };
}

watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.employmentType,
  () => props.open && fillForm(),
);

function onSubmit() {
  const input = { name: form.value.name?.trim() || null };
  emit("save", { id: props.employmentType?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Tipe Kepegawaian' : 'Tambah Tipe Kepegawaian'"
    size="md"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div>
      <label :class="labelCls">Nama Tipe Kepegawaian *</label>
      <input v-model="form.name" type="text" required :class="fieldCls" />
    </div>
  </BaseModal>
</template>
