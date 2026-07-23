<script setup>
// Form tambah/ubah aturan cuti — kontrak LeaveRuleInput.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useLeaveTypeSearch } from "@/features/leaveTypes/composables/useLeaveTypeSearch";
import { useLeaveRuleDetail } from "../composables/useLeaveRuleDetail";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Aturan cuti yang sedang diubah (baris list). null = mode tambah.
  leaveRule: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.leaveRule?.id);

// Saat edit, ambil data lengkap via getLeaveRule.
const editId = computed(() => (props.open && props.leaveRule?.id ? props.leaveRule.id : null));
const { leaveRule: fullRule } = useLeaveRuleDetail(editId);

// Pencarian perusahaan & tipe cuti untuk pilihan companyId / leaveTypeId.
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } = useCompanySearch();
const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } = useLeaveTypeSearch();
const companySelected = ref(null);
const leaveTypeSelected = ref(null);

const blank = () => ({
  companyId: "",
  leaveTypeId: "",
  daysPerYear: "",
  minServiceMonth: "",
  minimumNoticeDays: "",
  maxConsecutiveDays: "",
  allowHalfDay: false,
  allowCarryForward: false,
  maxCarryForward: "",
  carryForwardExpireAfterMonths: "",
  allowNegativeBalance: false,
});

const form = ref(blank());

// Angka → string untuk input ("" bila kosong; 0 tetap tampil).
function toNumStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function fillForm() {
  // Utamakan data lengkap dari getLeaveRule; fallback ke baris list.
  const s = fullRule.value ?? props.leaveRule;
  if (props.leaveRule?.id) {
    form.value = {
      companyId: s.company?.id ?? "",
      leaveTypeId: s.leaveType?.id ?? "",
      daysPerYear: toNumStr(s.daysPerYear),
      minServiceMonth: toNumStr(s.minServiceMonth),
      minimumNoticeDays: toNumStr(s.minimumNoticeDays),
      maxConsecutiveDays: toNumStr(s.maxConsecutiveDays),
      allowHalfDay: !!s.allowHalfDay,
      allowCarryForward: !!s.allowCarryForward,
      maxCarryForward: toNumStr(s.maxCarryForward),
      carryForwardExpireAfterMonths: toNumStr(s.carryForwardExpireAfterMonths),
      allowNegativeBalance: !!s.allowNegativeBalance,
    };
    companySelected.value = s.company ?? null;
    leaveTypeSelected.value = s.leaveType ?? null;
  } else {
    form.value = blank();
    companySelected.value = null;
    leaveTypeSelected.value = null;
  }
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.leaveRule, () => props.open && fillForm());
// Data lengkap tiba async → prefill ulang.
watch(fullRule, () => props.open && fillForm());

// Konversi angka → tipe backend, null bila kosong/tidak valid.
function toInt(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}
function toFloat(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function onSubmit() {
  const f = form.value;
  const carry = !!f.allowCarryForward;
  const input = {
    companyId: toInt(f.companyId),
    leaveTypeId: toInt(f.leaveTypeId),
    daysPerYear: toFloat(f.daysPerYear),
    minServiceMonth: toInt(f.minServiceMonth),
    minimumNoticeDays: toInt(f.minimumNoticeDays),
    maxConsecutiveDays: toInt(f.maxConsecutiveDays),
    allowHalfDay: !!f.allowHalfDay,
    allowCarryForward: carry,
    // Sub-field carry forward hanya relevan bila carry forward diizinkan.
    maxCarryForward: carry ? toFloat(f.maxCarryForward) : null,
    carryForwardExpireAfterMonths: carry ? toInt(f.carryForwardExpireAfterMonths) : null,
    allowNegativeBalance: !!f.allowNegativeBalance,
  };
  emit("save", { id: props.leaveRule?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const toggleCls = "flex cursor-pointer items-center gap-2.5 rounded-lg border border-mahir-border p-3 text-sm text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Aturan Cuti' : 'Tambah Aturan Cuti'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <label :class="labelCls">Tipe Cuti *</label>
        <SearchableSelect
          v-model="form.leaveTypeId"
          :selected="leaveTypeSelected"
          :options="leaveTypeOptions"
          :loading="leaveTypeLoading"
          placeholder="Pilih tipe cuti"
          search-placeholder="Cari tipe cuti…"
          @search="setLeaveTypeSearch"
        />
      </div>

      <div>
        <label :class="labelCls">Kuota per Tahun (hari)</label>
        <input v-model="form.daysPerYear" type="number" min="0" step="0.5" :class="fieldCls" placeholder="mis. 12" />
      </div>
      <div>
        <label :class="labelCls">Min. Masa Kerja (bulan)</label>
        <input v-model="form.minServiceMonth" type="number" min="0" :class="fieldCls" placeholder="0" />
      </div>
      <div>
        <label :class="labelCls">Min. Pemberitahuan (hari)</label>
        <input v-model="form.minimumNoticeDays" type="number" min="0" :class="fieldCls" placeholder="0" />
      </div>
      <div>
        <label :class="labelCls">Maks. Hari Berturut-turut</label>
        <input v-model="form.maxConsecutiveDays" type="number" min="0" :class="fieldCls" placeholder="0" />
      </div>

      <!-- Ketentuan boolean -->
      <label :class="toggleCls">
        <input v-model="form.allowHalfDay" type="checkbox" class="h-4 w-4 accent-mahir-primary" />
        Izinkan setengah hari
      </label>
      <label :class="toggleCls">
        <input v-model="form.allowNegativeBalance" type="checkbox" class="h-4 w-4 accent-mahir-primary" />
        Izinkan saldo minus
      </label>

      <!-- Carry forward + sub-field -->
      <div class="md:col-span-2">
        <label :class="toggleCls">
          <input v-model="form.allowCarryForward" type="checkbox" class="h-4 w-4 accent-mahir-primary" />
          Izinkan carry forward (sisa cuti dibawa ke tahun berikutnya)
        </label>
      </div>
      <template v-if="form.allowCarryForward">
        <div>
          <label :class="labelCls">Maks. Carry Forward (hari)</label>
          <input v-model="form.maxCarryForward" type="number" min="0" step="0.5" :class="fieldCls" placeholder="0" />
        </div>
        <div>
          <label :class="labelCls">Kedaluwarsa Carry Forward (bulan)</label>
          <input
            v-model="form.carryForwardExpireAfterMonths"
            type="number"
            min="0"
            :class="fieldCls"
            placeholder="0"
          />
        </div>
      </template>
    </div>
  </BaseModal>
</template>
