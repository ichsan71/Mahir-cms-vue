<script setup>
// Form tambah/ubah tipe cuti — kontrak LeaveTypeInput: name, description,
// paidSalaryComponentIds, needReason, needAttachment, needApproval, isActive,
// useParentApproval.
//
// Catatan: `isPaid` (lama) diganti `paidSalaryComponentIds` — daftar komponen
// gaji yang TETAP dibayarkan selama karyawan menjalani cuti jenis ini. Bila
// kosong → cuti tidak berbayar.
import { ref, computed, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useSalaryComponentTypeSearch } from "@/features/salaryComponentTypes/composables/useSalaryComponentTypeSearch";
import { LIST_SALARY_COMPONENT_TYPE } from "@/features/salaryComponentTypes/graphql/salaryComponentType.queries";
import { useLeaveTypeDetail } from "../composables/useLeaveTypeDetail";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Tipe cuti yang sedang diubah (baris list). null = mode tambah.
  leaveType: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.leaveType?.id);

// Saat edit, ambil data lengkap via getLeaveType.
const editId = computed(() => (props.open && props.leaveType?.id ? props.leaveType.id : null));
const { leaveType: fullType } = useLeaveTypeDetail(editId);

// Picker komponen gaji (async search) untuk paidSalaryComponentIds.
const { options: componentOptions, loading: componentLoading, setSearch: setComponentSearch } =
  useSalaryComponentTypeSearch();

// Katalog komponen aktif (untuk memetakan id → label chip saat prefill edit).
const { result: catalogResult } = useQuery(
  LIST_SALARY_COMPONENT_TYPE,
  () => ({ params: { isActive: true, page: 1, pageSize: 100 } }),
  () => ({ enabled: props.open, fetchPolicy: "cache-and-network" }),
);
const componentMap = computed(() => {
  const map = {};
  for (const c of catalogResult.value?.listSalaryComponentType?.data?.results ?? []) {
    map[String(c.id)] = c.code ? `${c.name} (${c.code})` : c.name;
  }
  return map;
});

const blank = () => ({
  name: "",
  description: "",
  paidSalaryComponentIds: [],
  needReason: false,
  needAttachment: false,
  needApproval: false,
  isActive: true,
  useParentApproval: false,
});

const form = ref(blank());

function fillForm() {
  const s = fullType.value ?? props.leaveType;
  form.value = props.leaveType?.id
    ? {
        name: s.name ?? "",
        description: s.description ?? "",
        paidSalaryComponentIds: (s.paidSalaryComponentIds ?? []).map((id) => Number(id)),
        needReason: !!s.needReason,
        needAttachment: !!s.needAttachment,
        needApproval: !!s.needApproval,
        isActive: s.isActive ?? true,
        useParentApproval: !!s.useParentApproval,
      }
    : blank();
}

// Chip terpilih {id, name} untuk SearchableSelect (mode multiple).
const selectedComponents = computed(() =>
  (form.value.paidSalaryComponentIds ?? []).map((id) => ({
    id,
    name: componentMap.value[String(id)] ?? `Komponen #${id}`,
  })),
);

watch(() => props.open, (open) => open && fillForm());
watch(() => props.leaveType, () => props.open && fillForm());
// Data lengkap tiba async → prefill ulang.
watch(fullType, () => props.open && fillForm());

function onSubmit() {
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    description: f.description?.trim() || null,
    paidSalaryComponentIds: (f.paidSalaryComponentIds ?? []).map((id) => Number(id)),
    needReason: !!f.needReason,
    needAttachment: !!f.needAttachment,
    needApproval: !!f.needApproval,
    isActive: !!f.isActive,
    useParentApproval: !!f.useParentApproval,
  };
  emit("save", { id: props.leaveType?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const toggleCls = "flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Tipe Cuti' : 'Tambah Tipe Cuti'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div>
        <label :class="labelCls">Nama Tipe Cuti *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Cuti Tahunan" />
      </div>

      <div>
        <label :class="labelCls">Deskripsi</label>
        <textarea v-model="form.description" rows="2" :class="fieldCls" placeholder="Opsional"></textarea>
      </div>

      <div>
        <label :class="labelCls">Komponen Gaji Dibayar Saat Cuti</label>
        <SearchableSelect
          v-model="form.paidSalaryComponentIds"
          :selected="selectedComponents"
          :options="componentOptions"
          :loading="componentLoading"
          multiple
          placeholder="Pilih komponen gaji…"
          search-placeholder="Cari komponen…"
          @search="setComponentSearch"
        />
        <p class="mt-1 text-[12px] text-mahir-muted">
          Komponen gaji yang tetap dibayarkan selama cuti jenis ini. Kosongkan bila cuti tidak berbayar.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label :class="toggleCls">
          <input v-model="form.needApproval" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Butuh persetujuan</span>
            <span class="block text-[12px] text-mahir-muted">Pengajuan cuti harus disetujui atasan.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.useParentApproval" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Persetujuan atasan</span>
            <span class="block text-[12px] text-mahir-muted">Gunakan hierarki atasan sebagai penyetuju.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.needReason" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Wajib alasan</span>
            <span class="block text-[12px] text-mahir-muted">Karyawan wajib mengisi alasan cuti.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.needAttachment" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Wajib lampiran</span>
            <span class="block text-[12px] text-mahir-muted">Karyawan wajib melampirkan berkas (mis. surat dokter).</span>
          </span>
        </label>

        <label :class="[toggleCls, 'sm:col-span-2']">
          <input v-model="form.isActive" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Aktif</span>
            <span class="block text-[12px] text-mahir-muted">Tipe cuti dapat dipilih pada pengajuan.</span>
          </span>
        </label>
      </div>
    </div>
  </BaseModal>
</template>
