<script setup>
// Form ekspor data karyawan. Rentang tanggal (dateFrom/dateTo) memfilter tanggal
// daftar karyawan yang diekspor; filter perusahaan (companyIds) mempersempit ke
// perusahaan tertentu; hasil ekspor dikirim ke `email`.
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import DateRangeField from "@/shared/components/DateRangeField.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "submit"]);

// Pilihan perusahaan (multi) untuk filter companyIds di EmployeeParams.
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } = useCompanySearch();
const companySelected = ref([]);

// Email tujuan sengaja dikosongkan — user mengisi sendiri.
const blank = () => ({
  dateFrom: "",
  dateTo: "",
  email: "",
  companyIds: [],
});
const form = ref(blank());
const dateError = ref("");

// Isi ulang setiap kali modal dibuka agar tidak menyimpan input lama.
watch(
  () => props.open,
  (open) => {
    if (open) {
      form.value = blank();
      companySelected.value = [];
      dateError.value = "";
    }
  },
);

function onSubmit() {
  dateError.value = "";
  const { dateFrom, dateTo, companyIds } = form.value;
  // Rentang tanggal opsional, tapi bila keduanya diisi urutannya harus valid.
  if (dateFrom && dateTo && dateFrom > dateTo) {
    dateError.value = "Tanggal awal tidak boleh melebihi tanggal akhir.";
    return;
  }
  const filters = companyIds.length ? { companyIds: companyIds.map(Number) } : null;
  emit("submit", {
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    filters,
    email: form.value.email.trim(),
  });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Ekspor Data Karyawan"
    size="md"
    :loading="saving"
    submit-text="Kirim ke Email"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <p class="text-sm text-mahir-muted">
        Data karyawan akan diproses dan dikirim sebagai berkas ke email tujuan. Kosongkan rentang
        tanggal untuk mengekspor seluruh karyawan.
      </p>

      <div>
        <label :class="labelCls">Rentang Tanggal Daftar</label>
        <DateRangeField v-model:from="form.dateFrom" v-model:to="form.dateTo" />
      </div>
      <p v-if="dateError" class="-mt-2 text-sm text-red-600">{{ dateError }}</p>

      <div>
        <label :class="labelCls">Perusahaan</label>
        <SearchableSelect
          v-model="form.companyIds"
          multiple
          :selected="companySelected"
          :options="companyOptions"
          :loading="companyLoading"
          placeholder="Semua perusahaan"
          search-placeholder="Cari perusahaan…"
          @search="setCompanySearch"
        />
        <p class="mt-1 text-xs text-mahir-muted">Kosongkan untuk mengekspor semua perusahaan.</p>
      </div>

      <div>
        <label :class="labelCls">Kirim ke Email *</label>
        <input
          v-model="form.email"
          type="email"
          required
          :class="fieldCls"
          placeholder="nama@maztafarma.co.id"
        />
        <p class="mt-1 text-xs text-mahir-muted">Hasil ekspor akan dikirim ke alamat email ini.</p>
      </div>
    </div>
  </BaseModal>
</template>
