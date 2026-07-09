<script setup>
// Form tambah/ubah cabang — kontrak BranchInput (name, companyIds).
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
// Pastikan SearchableSelect mendukung prop `multiple` atau gunakan komponen multi-select Anda
import SearchableSelect from "@/shared/components/SearchableSelect.vue"; 
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Cabang yang sedang diubah (diprefill langsung dari baris list). null = mode tambah.
  branch: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.branch?.id);

// Pencarian perusahaan (param `search` pada listCompany) — reusable.
const { options: companyOptions, loading: companyLoading, setSearch } = useCompanySearch();
// Perusahaan yang sudah terpilih berupa array (untuk menampilkan multiple labels saat edit).
const companiesSelected = ref([]);

// Mengubah companyId menjadi array (companyIds)
const blank = () => ({ name: "", companyIds: [] });

const form = ref(blank());

// Prefill dari baris list. Mengambil semua relasi companies.
function fillForm() {
  const b = props.branch;
  if (b?.id) {
    const branchCompanies = b.companies ?? [];
    form.value = { 
      name: b.name ?? "", 
      companyIds: branchCompanies.map(c => c.id) // Ambil semua ID perusahaan
    };
    companiesSelected.value = branchCompanies; // Simpan semua objek perusahaan yang terpilih
  } else {
    form.value = blank();
    companiesSelected.value = [];
  }
}

watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.branch,
  () => props.open && fillForm(),
);

function onSubmit() {
  const input = {
    name: form.value.name?.trim() || null,
    companyIds: form.value.companyIds || [], // Mengirimkan array ID
  };
  console.log(input)
  emit("save", { id: props.branch?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Cabang' : 'Tambah Cabang'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label :class="labelCls">Nama Cabang *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>

      <div>
        <label :class="labelCls">Perusahaan induk *</label>
        <SearchableSelect
          v-model="form.companyIds"
          multiple
          :selected="companiesSelected"
          :options="companyOptions"
          :loading="companyLoading"
          placeholder="Pilih perusahaan"
          search-placeholder="Cari perusahaan…"
          @search="setSearch"
        />
      </div>
    </div>
  </BaseModal>
</template>