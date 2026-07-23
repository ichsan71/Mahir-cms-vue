<script setup>
// Form ajukan cuti — kontrak LeaveInput. Hanya mode tambah (createLeave).
// Status selalu "DRAFT" (tidak dipilih user); karyawan = akun login (read-only).
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useLeaveTypeSearch } from "@/features/leaveTypes/composables/useLeaveTypeSearch";
import { useAuthStore } from "@/features/auth/stores/auth.store";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "save"]);

const auth = useAuthStore();

// Selector tipe cuti.
const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } = useLeaveTypeSearch();
const leaveTypeSelected = ref(null);

const blank = () => ({
  leaveTypeId: "",
  startDate: "",
  endDate: "",
  totalDays: "",
  reason: "",
});

const form = ref(blank());
const attachment = ref(null); // File object (opsional)
const fileInput = ref(null);
// Pesan galat per field (validasi klien — SearchableSelect/datepicker bukan input native).
const errors = ref({});

function fillForm() {
  form.value = blank();
  attachment.value = null;
  if (fileInput.value) fileInput.value.value = "";
  leaveTypeSelected.value = null;
  errors.value = {};
}

watch(() => props.open, (open) => open && fillForm());

// Total hari (inklusif) otomatis dari rentang tanggal; tetap bisa diubah manual.
watch([() => form.value.startDate, () => form.value.endDate], ([s, e]) => {
  if (!s || !e) return;
  const ms = new Date(e) - new Date(s);
  if (!Number.isNaN(ms) && ms >= 0) form.value.totalDays = Math.floor(ms / 86400000) + 1;
});

function onFileChange(e) {
  attachment.value = e.target.files?.[0] ?? null;
}

// Validasi field wajib sebelum submit.
function validate() {
  const f = form.value;
  const next = {};
  if (!auth.employee?.id) next.employee = "Data karyawan akun tidak ditemukan.";
  if (!f.leaveTypeId) next.leaveTypeId = "Tipe cuti wajib dipilih.";
  if (!f.startDate) next.startDate = "Tanggal mulai wajib diisi.";
  if (!f.endDate) next.endDate = "Tanggal selesai wajib diisi.";
  if (f.startDate && f.endDate && new Date(f.endDate) < new Date(f.startDate)) {
    next.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }
  if (f.totalDays !== "" && Number(f.totalDays) <= 0) {
    next.totalDays = "Total hari harus lebih dari 0.";
  }
  errors.value = next;
  return Object.keys(next).length === 0;
}

function onSubmit() {
  if (!validate()) return;
  const f = form.value;
  const input = {
    // Karyawan = akun login (read-only).
    employeeId: auth.employee?.id ?? null,
    leaveTypeId: f.leaveTypeId || null,
    startDate: f.startDate || null,
    endDate: f.endDate || null,
    totalDays: f.totalDays === "" ? null : Number(f.totalDays),
    reason: f.reason?.trim() || null,
    // Status selalu draft saat pengajuan dibuat.
    status: "DRAFT",
    attachment: attachment.value || null,
  };
  emit("save", { input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const readonlyCls =
  "w-full cursor-not-allowed rounded-lg border border-mahir-border bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Ajukan Cuti"
    size="lg"
    :loading="saving"
    submit-text="Ajukan"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label :class="labelCls">Karyawan</label>
        <input :value="auth.employee?.fullName || '—'" type="text" readonly :class="readonlyCls" />
        <p v-if="errors.employee" class="mt-1 text-xs text-rose-500">{{ errors.employee }}</p>
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
        <p v-if="errors.leaveTypeId" class="mt-1 text-xs text-rose-500">{{ errors.leaveTypeId }}</p>
      </div>

      <div>
        <label :class="labelCls">Tanggal Mulai *</label>
        <VueDatePicker
          v-model="form.startDate"
          model-type="yyyy-MM-dd"
          format="dd MMM yyyy"
          :enable-time-picker="false"
          auto-apply
          placeholder="Pilih tanggal"
        />
        <p v-if="errors.startDate" class="mt-1 text-xs text-rose-500">{{ errors.startDate }}</p>
      </div>
      <div>
        <label :class="labelCls">Tanggal Selesai *</label>
        <VueDatePicker
          v-model="form.endDate"
          model-type="yyyy-MM-dd"
          format="dd MMM yyyy"
          :enable-time-picker="false"
          :min-date="form.startDate || undefined"
          auto-apply
          placeholder="Pilih tanggal"
        />
        <p v-if="errors.endDate" class="mt-1 text-xs text-rose-500">{{ errors.endDate }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Total Hari</label>
        <input v-model="form.totalDays" type="number" min="0" :class="fieldCls" placeholder="Otomatis dari tanggal" />
        <p v-if="errors.totalDays" class="mt-1 text-xs text-rose-500">{{ errors.totalDays }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Alasan</label>
        <textarea v-model="form.reason" rows="3" :class="fieldCls" placeholder="Alasan pengajuan cuti"></textarea>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Lampiran</label>
        <input
          ref="fileInput"
          type="file"
          class="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-mahir-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-mahir-primary hover:file:bg-mahir-primary-soft/80"
          @change="onFileChange"
        />
        <p class="mt-1 text-xs text-slate-400">Opsional — mis. surat dokter (PDF/gambar).</p>
      </div>
    </div>
  </BaseModal>
</template>

<style>
/* Selaraskan VueDatePicker dengan tema Mahir (radius & warna primary). */
:root {
  --dp-border-radius: 0.5rem;
  --dp-primary-color: #243b8f;
  --dp-font-size: 0.875rem;
}
.dp__input {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-color: var(--mahir-border, #e2e8f0);
}
</style>

