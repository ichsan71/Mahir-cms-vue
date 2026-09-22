<script setup>
// Form ajukan izin di jam kerja — kontrak LeaveAtWorkHourInput. Hanya mode
// tambah (createLeaveAtWorkHour). Karyawan = akun login (read-only); status
// dikirim "PENDING" agar langsung masuk alur persetujuan (tidak ada mutasi
// submit terpisah seperti pada cuti).
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

const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } = useLeaveTypeSearch();
const leaveTypeSelected = ref(null);

const blank = () => ({
  leaveTypeId: "",
  date: "",
  reason: "",
});

const form = ref(blank());
const attachment = ref(null);
const fileInput = ref(null);
const errors = ref({});

function fillForm() {
  form.value = blank();
  attachment.value = null;
  if (fileInput.value) fileInput.value.value = "";
  leaveTypeSelected.value = null;
  errors.value = {};
}

watch(() => props.open, (open) => open && fillForm());

function onFileChange(e) {
  attachment.value = e.target.files?.[0] ?? null;
}

function validate() {
  const f = form.value;
  const next = {};
  if (!auth.employee?.id) next.employee = "Data karyawan akun tidak ditemukan.";
  if (!f.leaveTypeId) next.leaveTypeId = "Tipe izin wajib dipilih.";
  if (!f.date) next.date = "Tanggal wajib diisi.";
  if (!f.reason?.trim()) next.reason = "Alasan wajib diisi.";
  errors.value = next;
  return Object.keys(next).length === 0;
}

function onSubmit() {
  if (!validate()) return;
  const f = form.value;
  const input = {
    employeeId: auth.employee?.id ?? null,
    leaveTypeId: f.leaveTypeId || null,
    date: f.date || null,
    reason: f.reason?.trim() || null,
    status: "PENDING",
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
    title="Ajukan Izin di Jam Kerja"
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
        <label :class="labelCls">Tipe Izin *</label>
        <SearchableSelect
          v-model="form.leaveTypeId"
          :selected="leaveTypeSelected"
          :options="leaveTypeOptions"
          :loading="leaveTypeLoading"
          placeholder="Pilih tipe izin"
          search-placeholder="Cari tipe izin…"
          @search="setLeaveTypeSearch"
        />
        <p v-if="errors.leaveTypeId" class="mt-1 text-xs text-rose-500">{{ errors.leaveTypeId }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Tanggal *</label>
        <VueDatePicker
          v-model="form.date"
          model-type="yyyy-MM-dd"
          format="dd MMM yyyy"
          :enable-time-picker="false"
          auto-apply
          placeholder="Pilih tanggal"
        />
        <p v-if="errors.date" class="mt-1 text-xs text-rose-500">{{ errors.date }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Alasan *</label>
        <textarea v-model="form.reason" rows="3" :class="fieldCls" placeholder="Alasan izin meninggalkan pekerjaan"></textarea>
        <p v-if="errors.reason" class="mt-1 text-xs text-rose-500">{{ errors.reason }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Lampiran</label>
        <input
          ref="fileInput"
          type="file"
          class="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-mahir-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-mahir-primary hover:file:bg-mahir-primary-soft/80"
          @change="onFileChange"
        />
        <p class="mt-1 text-xs text-slate-400">Opsional — mis. surat/bukti pendukung (PDF/gambar).</p>
      </div>
    </div>
  </BaseModal>
</template>

<style>
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
