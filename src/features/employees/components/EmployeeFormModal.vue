<script setup>
// Form tambah/edit karyawan (port dari x-modal-form di employees/index.blade.php)
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { DEPARTMENTS } from "../constants";

const props = defineProps({
  open: { type: Boolean, default: false },
  employee: { type: Object, default: null }, // null = mode tambah
  saving: { type: Boolean, default: false },
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
  image: null,
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
          image: props.employee.image ?? null,
        }
      : blank();
  },
);

// Upload foto: baca file jadi data URL base64 lalu simpan di form.image.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const imageError = ref("");

function onImageChange(event) {
  imageError.value = "";
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    imageError.value = "Berkas harus berupa gambar.";
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    imageError.value = "Ukuran gambar maksimal 2 MB.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.value.image = reader.result; // data URL base64
  };
  reader.onerror = () => {
    imageError.value = "Gagal membaca berkas gambar.";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  form.value.image = null;
  imageError.value = "";
}

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
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="mb-4 flex items-center gap-4">
      <span
        class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-mahir-border bg-slate-50 text-slate-300"
      >
        <img
          v-if="form.image"
          :src="form.image"
          alt="Foto karyawan"
          class="h-full w-full object-cover"
        />
        <span v-else class="text-xs">Foto</span>
      </span>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <label
            class="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            {{ form.image ? "Ganti Foto" : "Unggah Foto" }}
            <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
          </label>
          <button
            v-if="form.image"
            type="button"
            class="rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            @click="removeImage"
          >
            Hapus
          </button>
        </div>
        <p v-if="imageError" class="mt-1 text-xs text-rose-500">{{ imageError }}</p>
        <p v-else class="mt-1 text-xs text-slate-400">Format gambar, maks. 2 MB.</p>
      </div>
    </div>

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
