<script setup>
// Form tambah/ubah pola kerja — kontrak WorkPatternInput: name, description, companyId.
// Jadwal harian (details) dikelola terpisah, bukan lewat form ini.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useWorkPatternDetail } from "../composables/useWorkPatternDetail";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Pola kerja yang sedang diubah (baris list hanya membawa id/name). null = mode tambah.
  workPattern: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.workPattern?.id);

// Saat edit, ambil data lengkap (company & description) yang tak ada di baris list.
const editId = computed(() => (props.open && props.workPattern?.id ? props.workPattern.id : null));
const { workPattern: fullPattern } = useWorkPatternDetail(editId);

// Pencarian perusahaan (param `search` pada listCompany) untuk pilihan companyId.
const { options: companyOptions, loading: companyLoading, setSearch } = useCompanySearch();
// Perusahaan terpilih (untuk menampilkan label langsung saat edit).
const companySelected = ref(null);

const blank = () => ({
  name: "",
  description: "",
  companyId: "",
});

const form = ref(blank());

function fillForm() {
  // Utamakan data lengkap dari GET_WORK_PATTERN; fallback ke baris list untuk tampil cepat.
  const s = fullPattern.value ?? props.workPattern;
  if (props.workPattern?.id) {
    form.value = {
      name: s.name ?? "",
      description: s.description ?? "",
      companyId: s.company?.id ?? "",
    };
    companySelected.value = s.company ?? null;
  } else {
    form.value = blank();
    companySelected.value = null;
  }
}

watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.workPattern,
  () => props.open && fillForm(),
);
// Data lengkap tiba belakangan (async) → prefill ulang agar company/description terisi.
watch(fullPattern, () => props.open && fillForm());

function onSubmit() {
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    description: f.description?.trim() || null,
    companyId: f.companyId || null,
  };
  emit("save", { id: props.workPattern?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Pola Kerja' : 'Tambah Pola Kerja'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label :class="labelCls">Nama Pola Kerja *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Pola 5 Hari Kerja" />
      </div>

      <div>
        <label :class="labelCls">Perusahaan *</label>
        <SearchableSelect
          v-model="form.companyId"
          :selected="companySelected"
          :options="companyOptions"
          :loading="companyLoading"
          placeholder="Pilih perusahaan"
          search-placeholder="Cari perusahaan…"
          @search="setSearch"
        />
      </div>

      <div>
        <label :class="labelCls">Deskripsi</label>
        <textarea
          v-model="form.description"
          rows="3"
          :class="fieldCls"
          placeholder="Keterangan singkat pola kerja (opsional)"
        ></textarea>
      </div>
    </div>
  </BaseModal>
</template>
