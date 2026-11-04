<script setup>
// Form tambah/ubah approver wajib — kontrak LeaveMandatoryApproverInput
// (companyId, unitId, employeeId, order, isActive). Prefill edit dari baris list
// (company, unit, order, employee sudah tersedia di list; tak perlu query detail).
import { ref, computed, watch, nextTick } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useUnitSearch } from "@/features/units/composables/useUnitSearch";
import { useEmployeeSearch } from "@/features/employees/composables/useEmployeeSearch";

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
  employeeId: "",
  order: "",
  isActive: true,
});

const form = ref(blank());

// Pencarian karyawan untuk approver — daftar menyempit mengikuti unit (dan
// perusahaan) yang dipilih di atas. Filter dikirim ke listEmployee via params.
const employeeSelected = ref(null);
const { options: employeeOptions, loading: employeeLoading, setSearch: setEmployeeSearch } = useEmployeeSearch(
  () => {
    const unitId = toInt(form.value.unitId);
    const companyId = toInt(form.value.companyId);
    return {
      ...(unitId ? { unitIds: [unitId] } : {}),
      ...(companyId ? { companyIds: [companyId] } : {}),
    };
  },
);

function toNumStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

// Saat fillForm mengisi unit/perusahaan sekaligus, watcher reset approver di
// bawah tidak boleh ikut jalan (agar prefill approver saat edit tidak terhapus).
const isFilling = ref(false);

function fillForm() {
  isFilling.value = true;
  const s = props.approver;
  if (s?.id) {
    form.value = {
      companyId: s.company?.id ?? "",
      unitId: s.unit?.id ?? "",
      employeeId: s.employee?.id ?? "",
      order: toNumStr(s.order),
      isActive: true,
    };
    companySelected.value = s.company ?? null;
    unitSelected.value = s.unit ?? null;
    employeeSelected.value = s.employee
      ? { id: s.employee.id, name: s.employee.fullName }
      : null;
  } else {
    form.value = blank();
    companySelected.value = null;
    unitSelected.value = null;
    employeeSelected.value = null;
  }
  // Lepas guard setelah reaksi watcher selesai di-flush.
  nextTick(() => {
    isFilling.value = false;
  });
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.approver, () => props.open && fillForm());

// Bila unit / perusahaan diganti, approver sebelumnya bisa jadi tak lagi relevan
// (di luar unit baru) — kosongkan pilihannya agar user memilih ulang.
watch(
  () => [form.value.unitId, form.value.companyId],
  (next, prev) => {
    if (isFilling.value) return;
    if (!prev || (next[0] === prev[0] && next[1] === prev[1])) return;
    form.value.employeeId = "";
    employeeSelected.value = null;
  },
);

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
    employeeId: toInt(f.employeeId),
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
        <label :class="labelCls">Approver <span class="font-normal text-slate-400">(karyawan)</span></label>
        <SearchableSelect
          v-model="form.employeeId"
          :selected="employeeSelected"
          :options="employeeOptions"
          :loading="employeeLoading"
          placeholder="Pilih approver"
          search-placeholder="Cari karyawan…"
          @search="setEmployeeSearch"
        />
        <p class="mt-1 text-[12px] text-mahir-muted">
          Daftar karyawan otomatis menyesuaikan unit/perusahaan yang dipilih di atas.
        </p>
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
