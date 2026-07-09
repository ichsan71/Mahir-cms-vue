<script setup>
// Form pendaftaran karyawan baru — kontrak registerEmployee(username, email, input).
// Relasi (branch/company/unit/level/employmentType/shift/atasan) memakai
// SearchableSelect dengan query pencarian yang sudah ada (reusable).
import { ref, computed, watch } from "vue";
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

const blank = () => ({
  // Akun
  username: "",
  email: "",
  roleName: "",
  // Data pribadi
  firstName: "",
  middleName: "",
  lastName: "",
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

// Prefill dari data karyawan (mode edit) atau kosongkan (mode daftar baru).
function fillForm() {
  const e = props.employee;
  if (e?.id) {
    form.value = {
      // username/email tidak dipakai saat edit (editEmployee tak menerimanya).
      username: "",
      email: "",
      roleName: e.roleName ?? "",
      firstName: e.firstName ?? "",
      middleName: e.middleName ?? "",
      lastName: e.lastName ?? "",
      nik: e.nik ?? "",
      birthPlace: e.birthPlace ?? "",
      birthDate: toDate(e.birthDate),
      citizenship: e.citizenship ?? "",
      religion: e.religion ?? "",
      maritalStatus: e.maritalStatus ?? "",
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
    branchSelected.value = e.branch ?? null;
    empTypeSelected.value = e.employmentType ?? null;
    levelSelected.value = e.level ?? null;
    shiftSelected.value = e.shift ?? null;
    parentSelected.value = e.parent ? { id: e.parent.id, name: e.parent.fullName } : null;
    companiesSelected.value = e.companies ?? [];
    unitsSelected.value = e.units ?? [];
  } else {
    form.value = blank();
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

// Gabungkan nama lengkap dari bagian-bagiannya.
function buildFullName() {
  return [form.value.firstName, form.value.middleName, form.value.lastName]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");
}

function onSubmit() {
  const f = form.value;
  const fullName = buildFullName();
  const input = {
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
      <!-- Akun -->
      <div>
        <h3 :class="sectionCls">Akun</h3>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Username & email hanya saat daftar baru (editEmployee tak menerimanya) -->
          <div v-if="!isEdit">
            <label :class="labelCls">Username *</label>
            <input v-model="form.username" type="text" required :class="fieldCls" />
          </div>
          <div v-if="!isEdit">
            <label :class="labelCls">Email *</label>
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
            <label :class="labelCls">Nama Depan *</label>
            <input v-model="form.firstName" type="text" required :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Nama Tengah</label>
            <input v-model="form.middleName" type="text" :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Nama Belakang</label>
            <input v-model="form.lastName" type="text" :class="fieldCls" />
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
            <label :class="labelCls">Cabang</label>
            <SearchableSelect
              v-model="form.branchId"
              :selected="branchSelected"
              :options="branchOptions"
              :loading="branchLoading"
              placeholder="Pilih cabang"
              search-placeholder="Cari cabang…"
              @search="branchSearch"
            />
          </div>
          <div>
            <label :class="labelCls">Tipe Kepegawaian</label>
            <SearchableSelect
              v-model="form.employmentTypeId"
              :selected="empTypeSelected"
              :options="empTypeOptions"
              :loading="empTypeLoading"
              placeholder="Pilih tipe kepegawaian"
              search-placeholder="Cari tipe…"
              @search="empTypeSearch"
            />
          </div>
          <div>
            <label :class="labelCls">Level</label>
            <SearchableSelect
              v-model="form.levelId"
              :selected="levelSelected"
              :options="levelOptions"
              :loading="levelLoading"
              placeholder="Pilih level"
              search-placeholder="Cari level…"
              @search="levelSearch"
            />
          </div>
          <div>
            <label :class="labelCls">Shift</label>
            <SearchableSelect
              v-model="form.shiftId"
              :selected="shiftSelected"
              :options="shiftOptions"
              :loading="shiftLoading"
              placeholder="Pilih shift"
              search-placeholder="Cari shift…"
              @search="shiftSearch"
            />
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
            <label :class="labelCls">Perusahaan</label>
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
          </div>
          <div>
            <label :class="labelCls">Unit</label>
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
