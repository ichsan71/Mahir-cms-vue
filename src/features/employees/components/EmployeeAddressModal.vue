<script setup>
// Form tambah/ubah alamat karyawan. employeeId dibawa dari parent (halaman
// detail karyawan). address != null → mode ubah; null → mode tambah.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  employeeId: { type: [Number, String], default: null },
  // Alamat yang sedang diubah (objek dari employee.addresses). null = tambah baru.
  address: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.address?.id);

const blank = () => ({ line1: "", line2: "", city: "", state: "", country: "" });
const form = ref(blank());

function fillForm() {
  const a = props.address;
  form.value = a?.id
    ? {
        line1: a.line1 ?? "",
        line2: a.line2 ?? "",
        city: a.city ?? "",
        state: a.state ?? "",
        country: a.country ?? "",
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.address, () => props.open && fillForm());

function onSubmit() {
  const f = form.value;
  const input = {
    employeeId: props.employeeId ? Number(props.employeeId) : null,
    line1: f.line1?.trim() || null,
    line2: f.line2?.trim() || null,
    city: f.city?.trim() || null,
    state: f.state?.trim() || null,
    country: f.country?.trim() || null,
  };
  emit("save", { id: props.address?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Ubah Alamat' : 'Tambah Alamat'"
    size="md"
    :loading="saving"
    :submit-text="isEdit ? 'Simpan' : 'Tambah'"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div>
        <label :class="labelCls">Alamat Baris 1 *</label>
        <input v-model="form.line1" type="text" required :class="fieldCls" placeholder="Jalan, nomor rumah, RT/RW" />
      </div>
      <div>
        <label :class="labelCls">Alamat Baris 2</label>
        <input v-model="form.line2" type="text" :class="fieldCls" placeholder="Kelurahan, kecamatan (opsional)" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Kota</label>
          <input v-model="form.city" type="text" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Provinsi</label>
          <input v-model="form.state" type="text" :class="fieldCls" />
        </div>
      </div>
      <div>
        <label :class="labelCls">Negara</label>
        <input v-model="form.country" type="text" :class="fieldCls" placeholder="mis. Indonesia" />
      </div>
    </div>
  </BaseModal>
</template>
