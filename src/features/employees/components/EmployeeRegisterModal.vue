<script setup>
// Form pendaftaran karyawan baru — kontrak registerEmployee(username, email, input).
// Relasi (branch/company/unit/level/employmentType/shift/atasan) memakai
// SearchableSelect dengan query pencarian yang sudah ada (reusable).
import { ref, computed, watch } from "vue";
import { UserCircleIcon } from "@heroicons/vue/24/outline";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useUnitSearch } from "@/features/units/composables/useUnitSearch";
import { useLevelSearch } from "@/features/levels/composables/useLevelSearch";
import { useBranchSearch } from "@/features/branches/composables/useBranchSearch";
import { useEmploymentTypeSearch } from "@/features/employmentTypes/composables/useEmploymentTypeSearch";
import { useShiftSearch } from "@/features/shifts/composables/useShiftSearch";
import { useEmployeeSearch } from "../composables/useEmployeeSearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Karyawan yang sedang diubah (hasil getEmployee). null = mode daftar baru.
  employee: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.employee?.id);

// Composable pencarian per relasi (di-alias agar auto-unwrap di template).
const { options: companyOptions, loading: companyLoading, setSearch: companySearch } = useCompanySearch();
const { options: unitOptions, loading: unitLoading, setSearch: unitSearch } = useUnitSearch();
const { options: levelOptions, loading: levelLoading, setSearch: levelSearch } = useLevelSearch();
const { options: branchOptions, loading: branchLoading, setSearch: branchSearch } = useBranchSearch();
const { options: empTypeOptions, loading: empTypeLoading, setSearch: empTypeSearch } = useEmploymentTypeSearch();
const { options: shiftOptions, loading: shiftLoading, setSearch: shiftSearch } = useShiftSearch();
const { options: parentOptions, loading: parentLoading, setSearch: parentSearch } = useEmployeeSearch();

// Pilihan enum backend (introspeksi) — agama & status pernikahan.
const { options: religionOptions, loading: religionLoading } = useEnumChoices("ReligionChoices");
const { options: maritalStatusOptions, loading: maritalStatusLoading } = useEnumChoices("MaritalStatusChoices");

// Item terpilih (untuk menampilkan label langsung saat edit).
const branchSelected = ref(null);
const empTypeSelected = ref(null);
const levelSelected = ref(null);
const shiftSelected = ref(null);
const parentSelected = ref(null);
const companiesSelected = ref([]);
const unitsSelected = ref([]);

// Normalkan nilai tanggal ke "YYYY-MM-DD" untuk input type="date".
const toDate = (d) => (d ? String(d).slice(0, 10) : "");

// Cocokkan nilai enum tersimpan dari backend ke value opsi (nama enum introspeksi).
// Backend bisa mengembalikan format berbeda (mis. "islam" vs nama enum "ISLAM"),
// sedangkan <select> native butuh kecocokan string persis agar opsi ikut terpilih.
// Samakan dengan mengabaikan beda huruf besar/kecil & pemisah (spasi/_/-).
const normEnum = (s) => String(s ?? "").toLowerCase().replace(/[\s_-]/g, "");
function matchEnum(raw, options) {
  if (!raw) return "";
  const hit = options.find((o) => normEnum(o.value) === normEnum(raw));
  return hit ? hit.value : raw;
}

const blank = () => ({
  // Foto
  image: null,
  // Akun
  username: "",
  email: "",
  roleName: "",
  // Data pribadi
  firstName: "",
  middleName: "",
  lastName: "",
  fullName: "",
  nik: "",
  birthPlace: "",
  birthDate: "",
  citizenship: "",
  religion: "",
  maritalStatus: "",
  // Kepegawaian
  hiredDate: "",
  resignDate: "",
  talentaId: "",
  description: "",
  // Relasi
  branchId: "",
  employmentTypeId: "",
  levelId: "",
  shiftId: "",
  parentId: "",
  companyIds: [],
  unitIds: [],
});

const form = ref(blank());

// Pesan galat per field yang wajib diisi (branchId/companyIds/employmentTypeId/
// levelId/shiftId/unitIds/fullName — sesuai field non-null di skema backend).
// Divalidasi di sisi klien agar SearchableSelect (bukan input native) tetap wajib.
const errors = ref({});

// Menandai apakah "Nama Lengkap" pernah diubah manual. Selama belum disentuh,
// field ini ikut terisi otomatis dari nama depan/tengah/belakang. Sekali diubah
// manual, nilai manual dipertahankan (kecuali dikosongkan → auto lagi).
const fullNameTouched = ref(false);

// Prefill dari data karyawan (mode edit) atau kosongkan (mode daftar baru).
function fillForm() {
  errors.value = {};
  const e = props.employee;
  if (e?.id) {
    form.value = {
      // image hanya diisi bila user memilih berkas baru; foto lama ditampilkan
      // lewat imagePreview dan TIDAK dikirim ulang (backend butuh File, bukan URL).
      image: null,
      // username/email tidak dipakai saat edit (editEmployee tak menerimanya).
      username: "",
      email: "",
      roleName: e.roleName ?? "",
      firstName: e.firstName ?? "",
      middleName: e.middleName ?? "",
      lastName: e.lastName ?? "",
      fullName: e.fullName ?? "",
      nik: e.nik ?? "",
      birthPlace: e.birthPlace ?? "",
      birthDate: toDate(e.birthDate),
      citizenship: e.citizenship ?? "",
      religion: matchEnum(e.religion, religionOptions.value),
      maritalStatus: matchEnum(e.maritalStatus, maritalStatusOptions.value),
      hiredDate: toDate(e.hiredDate),
      resignDate: toDate(e.resignDate),
      talentaId: e.talentaId ?? "",
      description: e.description ?? "",
      branchId: e.branch?.id ?? "",
      employmentTypeId: e.employmentType?.id ?? "",
      levelId: e.level?.id ?? "",
      shiftId: e.shift?.id ?? "",
      parentId: e.parent?.id ?? "",
      companyIds: (e.companies ?? []).map((c) => c.id),
      unitIds: (e.units ?? []).map((u) => u.id),
    };
    // Nilai fullName tersimpan dianggap sudah "disentuh" agar tidak tertimpa auto.
    fullNameTouched.value = !!(e.fullName ?? "").trim();
    imagePreview.value = e.image ?? null;
    branchSelected.value = e.branch ?? null;
    empTypeSelected.value = e.employmentType ?? null;
    levelSelected.value = e.level ?? null;
    shiftSelected.value = e.shift ?? null;
    parentSelected.value = e.parent ? { id: e.parent.id, name: e.parent.fullName } : null;
    companiesSelected.value = e.companies ?? [];
    unitsSelected.value = e.units ?? [];
  } else {
    form.value = blank();
    fullNameTouched.value = false;
    imagePreview.value = null;
    branchSelected.value = null;
    empTypeSelected.value = null;
    levelSelected.value = null;
    shiftSelected.value = null;
    parentSelected.value = null;
    companiesSelected.value = [];
    unitsSelected.value = [];
  }
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.employee, () => props.open && fillForm());

// Saat opsi enum baru selesai dimuat (setelah form terisi), cocokkan ulang nilai
// tersimpan agar <select> ikut terpilih meski opsi datang belakangan.
watch(religionOptions, (opts) => {
  if (opts.length && form.value.religion) form.value.religion = matchEnum(form.value.religion, opts);
});
watch(maritalStatusOptions, (opts) => {
  if (opts.length && form.value.maritalStatus) form.value.maritalStatus = matchEnum(form.value.maritalStatus, opts);
});

// Upload foto: kirim objek File langsung agar apollo-upload-client memakai
// GraphQL multipart upload (backend butuh berkas nyata; string base64 memicu
// "'str' object has no attribute 'read'"). `form.image` menampung File yang akan
// dikirim, sedangkan `imagePreview` (data URL) hanya untuk pratinjau di layar.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const imageError = ref("");
const imagePreview = ref(null);

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
  form.value.image = file; // objek File → dikirim sebagai berkas (multipart)
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.value = reader.result; // data URL, hanya untuk pratinjau
  };
  reader.onerror = () => {
    imageError.value = "Gagal membaca berkas gambar.";
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  form.value.image = null;
  imagePreview.value = null;
  imageError.value = "";
}

// Gabungkan nama lengkap dari bagian-bagiannya.
function buildFullName() {
  return [form.value.firstName, form.value.middleName, form.value.lastName]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");
}

// Auto-isi "Nama Lengkap" dari nama depan/tengah/belakang selama belum diubah
// manual. Sekali diketik manual (fullNameTouched), nilai manual dipertahankan.
watch(
  () => [form.value.firstName, form.value.middleName, form.value.lastName],
  () => {
    if (!fullNameTouched.value) form.value.fullName = buildFullName();
  }
);

// Dipanggil saat user mengetik di field Nama Lengkap. Kosong = kembali ke mode
// auto; ada isinya = tandai manual agar tidak tertimpa nama depan/tengah/belakang.
function onFullNameInput() {
  fullNameTouched.value = !!form.value.fullName.trim();
}

// Validasi field wajib (non-null di skema backend). Mengisi `errors` dan
// mengembalikan true bila semua terisi. Relasi single memakai id, relasi
// multiple wajib punya minimal satu item.
function validate(fullName) {
  const f = form.value;
  const next = {};
  if (!fullName) next.fullName = "Nama lengkap wajib diisi.";
  if (!f.branchId) next.branchId = "Cabang wajib dipilih.";
  if (!f.employmentTypeId) next.employmentTypeId = "Tipe kepegawaian wajib dipilih.";
  if (!f.levelId) next.levelId = "Level wajib dipilih.";
  if (!f.shiftId) next.shiftId = "Shift wajib dipilih.";
  if (!f.companyIds?.length) next.companyIds = "Minimal satu perusahaan wajib dipilih.";
  if (!f.unitIds?.length) next.unitIds = "Minimal satu unit wajib dipilih.";
  errors.value = next;
  return Object.keys(next).length === 0;
}

function onSubmit() {
  const f = form.value;
  // Pakai isian manual bila ada; jika dikosongkan, jatuh ke gabungan nama.
  const fullName = f.fullName?.trim() || buildFullName();
  if (!validate(fullName)) return;
  const input = {
    image: f.image || null,
    firstName: f.firstName?.trim() || null,
    middleName: f.middleName?.trim() || null,
    lastName: f.lastName?.trim() || null,
    fullName: fullName || null,
    nik: f.nik?.trim() || null,
    birthPlace: f.birthPlace?.trim() || null,
    birthDate: f.birthDate || null,
    citizenship: f.citizenship?.trim() || null,
    religion: f.religion?.trim() || null,
    maritalStatus: f.maritalStatus?.trim() || null,
    hiredDate: f.hiredDate || null,
    // resignDate hanya relevan saat edit; saat daftar baru selalu null.
    resignDate: isEdit.value ? f.resignDate || null : null,
    talentaId: Number(f.talentaId) || null,
    description: f.description?.trim() || null,
    roleName: f.roleName?.trim() || null,
    branchId: f.branchId || null,
    employmentTypeId: f.employmentTypeId || null,
    levelId: f.levelId || null,
    shiftId: f.shiftId || null,
    parentId: f.parentId || null,
    companyIds: f.companyIds?.length ? f.companyIds : null,
    unitIds: f.unitIds?.length ? f.unitIds : null,
  };

  emit("save", {
    id: props.employee?.id ?? null,
    username: f.username?.trim(),
    email: f.email?.trim(),
    input,
  });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const sectionCls = "text-xs font-bold uppercase tracking-wider text-slate-400";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Karyawan' : 'Daftar Karyawan Baru'"
    size="xl"
    :loading="saving"
    :submit-text="isEdit ? 'Simpan' : 'Daftarkan'"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-6">
      <!-- Foto -->
      <div>
        <h3 :class="sectionCls">Foto</h3>
        <div class="mt-3 flex items-center gap-4">
          <span
            class="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-mahir-border bg-slate-50"
          >
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Foto karyawan"
              class="h-full w-full object-cover"
            />
            <UserCircleIcon v-else class="h-10 w-10 text-slate-300" />
          </span>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <label
                class="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                {{ imagePreview ? "Ganti Foto" : "Unggah Foto" }}
                <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
              </label>
              <button
                v-if="imagePreview"
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
      </div>

      <!-- Akun -->
      <div>
        <h3 :class="sectionCls">Akun</h3>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Username & email hanya saat daftar baru (editEmployee tak menerimanya) -->
          <div v-if="!isEdit">
            <label :class="labelCls">Username <span class="text-rose-500">*</span></label>
            <input v-model="form.username" type="text" required :class="fieldCls" />
          </div>
          <div v-if="!isEdit">
            <label :class="labelCls">Email <span class="text-rose-500">*</span></label>
            <input v-model="form.email" type="email" required :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Role</label>
            <input v-model="form.roleName" type="text" placeholder="mis. admin, staff" :class="fieldCls" />
          </div>
        </div>
      </div>

      <!-- Data Pribadi -->
      <div>
        <h3 :class="sectionCls">Data Pribadi</h3>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label :class="labelCls">Nama Depan</label>
            <input v-model="form.firstName" type="text" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Nama Tengah</label>
            <input v-model="form.middleName" type="text" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Nama Belakang</label>
            <input v-model="form.lastName" type="text" :class="fieldCls" />
          </div>
          <div class="md:col-span-3">
            <label :class="labelCls">Nama Lengkap <span class="text-rose-500">*</span></label>
            <input
              v-model="form.fullName"
              type="text"
              :class="fieldCls"
              placeholder="Terisi otomatis dari nama depan/tengah/belakang"
              @input="onFullNameInput"
            />
            <p v-if="errors.fullName" class="mt-1 text-xs text-rose-500">{{ errors.fullName }}</p>
            <p v-else class="mt-1 text-xs text-slate-400">
              Terisi otomatis dari nama depan/tengah/belakang. Bisa diubah manual.
            </p>
          </div>
          <div>
            <label :class="labelCls">NIK</label>
            <input v-model="form.nik" type="text" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Tempat Lahir</label>
            <input v-model="form.birthPlace" type="text" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Tanggal Lahir</label>
            <input v-model="form.birthDate" type="date" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Kewarganegaraan</label>
            <input v-model="form.citizenship" type="text" placeholder="mis. WNI" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Agama</label>
            <select v-model="form.religion" :disabled="religionLoading" :class="fieldCls">
              <option value="">{{ religionLoading ? "Memuat…" : "Pilih agama" }}</option>
              <option v-for="r in religionOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelCls">Status Pernikahan</label>
            <select v-model="form.maritalStatus" :disabled="maritalStatusLoading" :class="fieldCls">
              <option value="">{{ maritalStatusLoading ? "Memuat…" : "Pilih status pernikahan" }}</option>
              <option v-for="m in maritalStatusOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Kepegawaian -->
      <div>
        <h3 :class="sectionCls">Kepegawaian</h3>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label :class="labelCls">Tanggal Masuk</label>
            <input v-model="form.hiredDate" type="date" :class="fieldCls" />
          </div>
          <!-- Tanggal Resign hanya saat edit (diisi ketika karyawan keluar) -->
          <div v-if="isEdit">
            <label :class="labelCls">Tanggal Resign</label>
            <input v-model="form.resignDate" type="date" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Talenta ID</label>
            <input v-model="form.talentaId" type="text" :class="fieldCls" />
          </div>

          <div>
            <label :class="labelCls">Cabang <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.branchId"
              :selected="branchSelected"
              :options="branchOptions"
              :loading="branchLoading"
              placeholder="Pilih cabang"
              search-placeholder="Cari cabang…"
              @search="branchSearch"
            />
            <p v-if="errors.branchId" class="mt-1 text-xs text-rose-500">{{ errors.branchId }}</p>
          </div>
          <div>
            <label :class="labelCls">Tipe Kepegawaian <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.employmentTypeId"
              :selected="empTypeSelected"
              :options="empTypeOptions"
              :loading="empTypeLoading"
              placeholder="Pilih tipe kepegawaian"
              search-placeholder="Cari tipe…"
              @search="empTypeSearch"
            />
            <p v-if="errors.employmentTypeId" class="mt-1 text-xs text-rose-500">{{ errors.employmentTypeId }}</p>
          </div>
          <div>
            <label :class="labelCls">Level <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.levelId"
              :selected="levelSelected"
              :options="levelOptions"
              :loading="levelLoading"
              placeholder="Pilih level"
              search-placeholder="Cari level…"
              @search="levelSearch"
            />
            <p v-if="errors.levelId" class="mt-1 text-xs text-rose-500">{{ errors.levelId }}</p>
          </div>
          <div>
            <label :class="labelCls">Shift <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.shiftId"
              :selected="shiftSelected"
              :options="shiftOptions"
              :loading="shiftLoading"
              placeholder="Pilih shift"
              search-placeholder="Cari shift…"
              @search="shiftSearch"
            />
            <p v-if="errors.shiftId" class="mt-1 text-xs text-rose-500">{{ errors.shiftId }}</p>
          </div>
          <div>
            <label :class="labelCls">Atasan Langsung</label>
            <SearchableSelect
              v-model="form.parentId"
              :selected="parentSelected"
              :options="parentOptions"
              :loading="parentLoading"
              placeholder="Pilih atasan"
              search-placeholder="Cari karyawan…"
              @search="parentSearch"
            />
          </div>

          <div>
            <label :class="labelCls">Perusahaan <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.companyIds"
              multiple
              :selected="companiesSelected"
              :options="companyOptions"
              :loading="companyLoading"
              placeholder="Pilih perusahaan"
              search-placeholder="Cari perusahaan…"
              @search="companySearch"
            />
            <p v-if="errors.companyIds" class="mt-1 text-xs text-rose-500">{{ errors.companyIds }}</p>
          </div>
          <div>
            <label :class="labelCls">Unit <span class="text-rose-500">*</span></label>
            <SearchableSelect
              v-model="form.unitIds"
              multiple
              :selected="unitsSelected"
              :options="unitOptions"
              :loading="unitLoading"
              placeholder="Pilih unit"
              search-placeholder="Cari unit…"
              @search="unitSearch"
            />
            <p v-if="errors.unitIds" class="mt-1 text-xs text-rose-500">{{ errors.unitIds }}</p>
          </div>
        </div>
      </div>

      <!-- Catatan -->
      <div>
        <label :class="labelCls">Deskripsi / Catatan</label>
        <textarea v-model="form.description" rows="3" :class="fieldCls"></textarea>
      </div>
    </div>
  </BaseModal>
</template>
