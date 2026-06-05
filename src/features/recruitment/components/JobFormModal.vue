<script setup>
// Form buka lowongan baru (port dari x-modal-form addJobModal)
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["update:open", "save"]);

const DEPTS = ["Engineering", "HR", "Finance", "Marketing", "Operations", "IT", "Legal", "Product"];

const blank = () => ({ title: "", dept: "", quota: 1, deadline: "" });
const form = ref(blank());

watch(
  () => props.open,
  (open) => {
    if (open) form.value = blank();
  },
);

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function onSubmit() {
  emit("save", {
    title: form.value.title,
    dept: form.value.dept,
    quota: Number(form.value.quota),
    deadline: fmt(form.value.deadline),
  });
}

const fieldCls = "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Buka Lowongan Baru"
    size="lg"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="md:col-span-2">
        <label :class="labelCls">Nama Posisi *</label>
        <input v-model="form.title" type="text" required placeholder="cth. Senior Product Designer" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Departemen *</label>
        <select v-model="form.dept" required :class="fieldCls">
          <option value="">Pilih departemen</option>
          <option v-for="d in DEPTS" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label :class="labelCls">Jumlah Kebutuhan *</label>
        <input v-model="form.quota" type="number" min="1" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Deadline Lamaran *</label>
        <input v-model="form.deadline" type="date" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Tipe Pekerjaan</label>
        <select :class="fieldCls">
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Kontrak</option>
          <option>Magang</option>
        </select>
      </div>
    </div>
  </BaseModal>
</template>
