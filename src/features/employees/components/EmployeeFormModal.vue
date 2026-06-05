<script setup>
// Form tambah/edit karyawan (port dari x-modal-form di employees/index.blade.php)
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { DEPARTMENTS } from "../constants";

const props = defineProps({
  open: { type: Boolean, default: false },
  employee: { type: Object, default: null }, // null = mode tambah
});

const emit = defineEmits(["update:open", "save"]);

const blank = () => ({
  name: "",
  email: "",
  phone: "",
  dept: "",
  position: "",
  join: "",
  status: "active",
});

const form = ref(blank());

// Isi ulang form setiap kali modal dibuka
watch(
  () => props.open,
  (open) => {
    if (!open) return;
    form.value = props.employee
      ? {
          name: props.employee.name,
          email: props.employee.email || "",
          phone: props.employee.phone || "",
          dept: props.employee.dept,
          position: props.employee.position,
          join: props.employee.join || "",
          status: props.employee.status,
        }
      : blank();
  },
);

function onSubmit() {
  emit("save", { id: props.employee?.id ?? null, input: { ...form.value } });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="employee ? 'Edit Karyawan' : 'Tambah Karyawan'"
    size="lg"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label :class="labelCls">Nama Lengkap *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Email Kantor *</label>
        <input v-model="form.email" type="email" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Nomor Telepon</label>
        <input v-model="form.phone" type="tel" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Departemen *</label>
        <select v-model="form.dept" required :class="fieldCls">
          <option value="">Pilih departemen</option>
          <option v-for="d in DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label :class="labelCls">Jabatan *</label>
        <input v-model="form.position" type="text" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Tanggal Bergabung</label>
        <input v-model="form.join" type="text" placeholder="mis. 12 Jan 2024" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Status</label>
        <select v-model="form.status" :class="fieldCls">
          <option value="active">Aktif</option>
          <option value="inactive">Non-Aktif</option>
        </select>
      </div>
    </div>
  </BaseModal>
</template>
