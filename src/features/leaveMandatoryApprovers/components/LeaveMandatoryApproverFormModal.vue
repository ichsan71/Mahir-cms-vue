<script setup>
// Form tambah/ubah approver wajib — kontrak LeaveMandatoryApproverInput
// (companyId, unitId, order, isActive). Prefill edit dari baris list (company,
// unit, order sudah tersedia di list; tak perlu query detail terpisah).
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useUnitSearch } from "@/features/units/composables/useUnitSearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Baris approver yang sedang diubah. null = mode tambah.
  approver: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.approver?.id);

// Pencarian perusahaan & unit untuk pilihan companyId / unitId.
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } = useCompanySearch();
const { options: unitOptions, loading: unitLoading, setSearch: setUnitSearch } = useUnitSearch();
const companySelected = ref(null);
const unitSelected = ref(null);

const blank = () => ({
  companyId: "",
  unitId: "",
  order: "",
  isActive: true,
});

const form = ref(blank());

function toNumStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function fillForm() {
  const s = props.approver;
  if (s?.id) {
    form.value = {
      companyId: s.company?.id ?? "",
      unitId: s.unit?.id ?? "",
      order: toNumStr(s.order),
      isActive: true,
    };
    companySelected.value = s.company ?? null;
    unitSelected.value = s.unit ?? null;
  } else {
    form.value = blank();
    companySelected.value = null;
    unitSelected.value = null;
  }
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.approver, () => props.open && fillForm());

// Konversi angka → integer backend, null bila kosong/tidak valid.
function toInt(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

function onSubmit() {
  const f = form.value;
  const input = {
    companyId: toInt(f.companyId),
    unitId: toInt(f.unitId),
    order: toInt(f.order),
  };
  // isActive hanya bagian kontrak create (edit tidak menyertakannya).
  if (!isEdit.value) input.isActive = !!f.isActive;
  emit("save", { id: props.approver?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Approver Wajib' : 'Tambah Approver Wajib'"
    size="md"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div>
        <label :class="labelCls">Perusahaan *</label>
        <SearchableSelect
          v-model="form.companyId"
          :selected="companySelected"
          :options="companyOptions"
          :loading="companyLoading"
          placeholder="Pilih perusahaan"
          search-placeholder="Cari perusahaan…"
          @search="setCompanySearch"
        />
      </div>

      <div>
        <label :class="labelCls">Unit <span class="font-normal text-slate-400">(opsional)</span></label>
        <SearchableSelect
          v-model="form.unitId"
          :selected="unitSelected"
          :options="unitOptions"
          :loading="unitLoading"
          placeholder="Semua unit"
          search-placeholder="Cari unit…"
          @search="setUnitSearch"
        />
        <p class="mt-1 text-[12px] text-mahir-muted">Kosongkan bila berlaku untuk semua unit di perusahaan ini.</p>
      </div>

      <div>
        <label :class="labelCls">Urutan Approval *</label>
        <input
          v-model="form.order"
          type="number"
          min="1"
          required
          :class="fieldCls"
          placeholder="mis. 1"
        />
        <p class="mt-1 text-[12px] text-mahir-muted">Menentukan urutan approver (1 = approver pertama).</p>
      </div>

      <label
        v-if="!isEdit"
        class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3"
      >
        <input v-model="form.isActive" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">Aktif</span>
          <span class="block text-[12px] text-mahir-muted">Approver ini langsung berlaku pada alur persetujuan.</span>
        </span>
      </label>
    </div>
  </BaseModal>
</template>
