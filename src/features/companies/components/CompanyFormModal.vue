<script setup>
// Form tambah/ubah perusahaan — kontrak CompanyInput backend.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { abbreviatePrefix } from "@/shared/utils/format";
import { useCompanySearch } from "../composables/useCompanySearch";
import { PhotoIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Perusahaan yang sedang diubah (hasil getCompany). null = mode tambah.
  company: { type: Object, default: null },
});

// Mode ubah bila ada perusahaan dengan id valid.
const isEdit = computed(() => !!props.company?.id);

const emit = defineEmits(["update:open", "save"]);

// Pencarian perusahaan induk (param `search` pada listCompany).
const { options: searchOptions, loading: searchLoading, setSearch } = useCompanySearch();
// Sembunyikan perusahaan itu sendiri dari pilihan induk.
const parentChoices = computed(() =>
  searchOptions.value.filter((c) => String(c.id) !== String(props.company?.id)),
);
// Induk yang sudah terpilih (untuk menampilkan label langsung saat edit).
const parentSelected = ref(null);

// true  → perusahaan ini sebagai induk (parentId = null)
// false → perusahaan ini memiliki induk (parentId = pilihan dari daftar)
const isParent = ref(true);

const blank = () => ({
  name: "",
  legalName: "",
  email: "",
  phone: "",
  website: "",
  npwp: "",
  logo: "", // diisi base64 data URL hasil unggah file
  parentId: ""
});

const form = ref(blank());

// Prefix = singkatan otomatis dari nama perusahaan (helper bersama:
// membuang simbol & mengabaikan kata penghubung seperti dan/and/or).
const prefixAbbr = computed(() => abbreviatePrefix(form.value.name));

const logoName = ref(""); // nama file logo untuk ditampilkan
const logoImg = ref(null); // File object yang dikirim langsung ke backend
const logoError = ref("");
const fileInput = ref(null);

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB

// Simpan File object untuk dikirim (multipart upload) + base64 untuk pratinjau.
function onLogoChange(e) {
  logoError.value = "";
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    logoError.value = "Berkas harus berupa gambar.";
    return;
  }
  if (file.size > MAX_LOGO_SIZE) {
    logoError.value = "Ukuran logo maksimal 2 MB.";
    return;
  }

  logoImg.value = file;
  logoName.value = file.name;

  // Pratinjau: base64 data URL (tidak dikirim, hanya untuk <img>).
  const reader = new FileReader();
  reader.onload = () => {
    form.value.logo = reader.result;
  };
  reader.onerror = () => {
    logoError.value = "Gagal membaca berkas.";
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  form.value.logo = "";
  logoImg.value = null;
  logoName.value = "";
  logoError.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

// Isi form dari data perusahaan (mode ubah) atau kosongkan (mode tambah).
// Bila perusahaan sudah punya induk → status "memiliki induk" dengan induk
// terpilih ditampilkan langsung.
function fillForm() {
  const c = props.company;
  if (c?.id) {
    form.value = {
      name: c.name ?? "",
      legalName: c.legalName ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      website: c.website ?? "",
      npwp: c.npwp ?? "",
      logo: c.logo ?? "",
      parentId: c.parent?.id ?? "",
    };
    logoName.value = c.logo ? "Logo saat ini" : "";
    isParent.value = !c.parent;
    parentSelected.value = c.parent ?? null;
  } else {
    form.value = blank();
    logoName.value = "";
    isParent.value = true;
    parentSelected.value = null;
  }
  logoImg.value = null;
  logoError.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

// Isi ulang form setiap modal dibuka, dan saat data perusahaan tiba
// (getCompany memuat async setelah modal terbuka).
watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.company,
  () => props.open && fillForm(),
);

// Kosongkan pilihan induk ketika beralih kembali menjadi perusahaan induk.
watch(isParent, (val) => {
  if (val) {
    form.value.parentId = "";
    parentSelected.value = null;
  }
});

function onSubmit() {
  // Susun payload sesuai CompanyInput; kosong → null agar konsisten dengan backend.
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    legalName: f.legalName?.trim() || null,
    email: f.email?.trim() || null,
    phone: f.phone?.trim() || null,
    website: f.website?.trim() || null,
    npwp: f.npwp?.trim() || null,
    // Prefix = singkatan otomatis dari nama perusahaan.
    prefix: prefixAbbr.value || null,
    // Induk → null; bukan induk → id perusahaan induk terpilih.
    parentId: isParent.value ? null : f.parentId || null,
  };

  // Logo hanya dikirim bila pengguna memilih berkas baru (File object) — sama
  // untuk create & edit. Saat edit tanpa ganti logo, field `logo` tidak dikirim
  // agar logo lama tetap dipertahankan backend (tidak terhapus jadi null).
  if (logoImg.value) input.logo = logoImg.value;

  emit("save", { id: props.company?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Perusahaan' : 'Tambah Perusahaan'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label :class="labelCls">Nama Perusahaan *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Nama Legal</label>
        <input v-model="form.legalName" type="text" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Email</label>
        <input v-model="form.email" type="email" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Nomor Telepon</label>
        <input v-model="form.phone" type="tel" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Website</label>
        <input v-model="form.website" type="url" placeholder="https://" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">NPWP</label>
        <input v-model="form.npwp" type="text" :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Prefix</label>
        <input
          :value="prefixAbbr || '—'"
          type="text"
          readonly
          class="w-full cursor-not-allowed rounded-lg border border-mahir-border bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-600"
        />
        <p class="mt-1 text-xs text-slate-400">Dibuat otomatis dari nama perusahaan.</p>
      </div>
      <div class="md:col-span-2">
        <label :class="labelCls">Logo</label>
        <div class="flex items-center gap-4">
          <!-- Pratinjau -->
          <div
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-mahir-border bg-slate-50"
          >
            <img v-if="form.logo" :src="form.logo" alt="Pratinjau logo" class="h-full w-full object-cover" />
            <PhotoIcon v-else class="h-6 w-6 text-slate-300" />
          </div>

          <div class="flex-1">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-mahir-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-mahir-primary hover:file:bg-mahir-primary-soft/80"
              @change="onLogoChange"
            />
            <div class="mt-1 flex items-center gap-2">
              <p v-if="logoError" class="text-xs text-red-500">{{ logoError }}</p>
              <template v-else-if="logoName">
                <span class="truncate text-xs text-slate-500">{{ logoName }}</span>
                <button
                  type="button"
                  class="text-xs font-medium text-red-500 hover:underline"
                  @click="removeLogo"
                >
                  Hapus
                </button>
              </template>
              <p v-else class="text-xs text-slate-400">PNG/JPG, maksimal 2 MB.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status induk (menentukan parentId) -->
      <div class="md:col-span-2">
        <label :class="labelCls">Apakah perusahaan ini sebagai induk?</label>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input v-model="isParent" type="radio" :value="true" class="text-mahir-primary focus:ring-mahir-primary" />
            Ya, sebagai induk
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input v-model="isParent" type="radio" :value="false" class="text-mahir-primary focus:ring-mahir-primary" />
            Tidak, memiliki induk
          </label>
        </div>
      </div>

      <!-- Perusahaan Induk (parentId) — hanya muncul bila bukan induk -->
      <div v-if="!isParent" class="md:col-span-2">
        <label :class="labelCls">Perusahaan Induk *</label>
        <SearchableSelect
          v-model="form.parentId"
          :selected="parentSelected"
          :options="parentChoices"
          :loading="searchLoading"
          placeholder="Pilih perusahaan induk"
          search-placeholder="Cari perusahaan…"
          @search="setSearch"
        />
      </div>
    </div>
  </BaseModal>
</template>
