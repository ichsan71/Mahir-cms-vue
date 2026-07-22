<script setup>
// Form tambah/ubah alamat cabang — memakai peta Google Maps untuk memilih titik.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import AddressMapPicker from "./AddressMapPicker.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  branchId: { type: [Number, String], default: null },
  // Alamat yang sedang diubah (null = mode tambah).
  address: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.address?.id);

const blank = () => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "",
  latitude: null,
  longitude: null,
});

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
        latitude: a.latitude ?? null,
        longitude: a.longitude ?? null,
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());

function onSubmit() {
  // Koordinat sebagai Float; null bila kosong/tidak valid.
  const toFloat = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const f = form.value;
  const input = {
    branchId: props.branchId != null ? Number(props.branchId) : null,
    line1: f.line1?.trim() || null,
    line2: f.line2?.trim() || null,
    city: f.city?.trim() || null,
    state: f.state?.trim() || null,
    country: f.country?.trim() || null,
  };
  // Sertakan koordinat hanya bila ada nilainya, agar edit tanpa menyentuh peta
  // tidak menimpa koordinat lama dengan null.
  const lat = toFloat(f.latitude);
  const lng = toFloat(f.longitude);
  if (lat !== null) input.latitude = lat;
  if (lng !== null) input.longitude = lng;

  emit("save", { id: props.address?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Ubah Alamat Cabang' : 'Tambah Alamat Cabang'"
    size="lg"
    :loading="saving"
    :submit-text="isEdit ? 'Simpan' : 'Tambah'"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <!-- Peta + pencarian -->
      <AddressMapPicker v-model="form" />

      <!-- Field alamat (bisa dikoreksi manual) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label :class="labelCls">Alamat (baris 1)</label>
          <input v-model="form.line1" type="text" :class="fieldCls" placeholder="Nama jalan, nomor" />
        </div>
        <div class="sm:col-span-2">
          <label :class="labelCls">Alamat (baris 2)</label>
          <input v-model="form.line2" type="text" :class="fieldCls" placeholder="Patokan, RT/RW, dll (opsional)" />
        </div>
        <div>
          <label :class="labelCls">Kota</label>
          <input v-model="form.city" type="text" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Provinsi</label>
          <input v-model="form.state" type="text" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Negara</label>
          <input v-model="form.country" type="text" :class="fieldCls" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label :class="labelCls">Latitude</label>
            <input :value="form.latitude" type="text" readonly :class="fieldCls + ' bg-slate-50'" />
          </div>
          <div>
            <label :class="labelCls">Longitude</label>
            <input :value="form.longitude" type="text" readonly :class="fieldCls + ' bg-slate-50'" />
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
