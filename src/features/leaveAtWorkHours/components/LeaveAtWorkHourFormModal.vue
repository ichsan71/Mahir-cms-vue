<script setup>
// Form izin di jam kerja — kontrak LeaveAtWorkHourInput. Dua mode:
//  • Tambah (prop `leave` null) → createLeaveAtWorkHour, status "DRAFT".
//  • Ubah   (prop `leave` berisi baris DRAFT) → editLeaveAtWorkHour(id, input).
// Karyawan = akun login (read-only). Izin dikirim ke persetujuan lewat mutasi
// submitLeaveAtWorkHour terpisah (tombol "Kirim" di list), BUKAN dari form ini.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useLeaveTypeSearch } from "@/features/leaveTypes/composables/useLeaveTypeSearch";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { validateFile, ATTACHMENT_MIME, ATTACHMENT_ACCEPT, ATTACHMENT_HINT, MB } from "@/shared/utils/validateUpload";
import { PaperClipIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Baris izin yang diubah (status DRAFT). null = mode tambah.
  leave: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const auth = useAuthStore();

const isEdit = computed(() => !!props.leave?.id);

const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } = useLeaveTypeSearch();
const leaveTypeSelected = ref(null);

const blank = () => ({
  leaveTypeId: "",
  date: "",
  reason: "",
  expectedCheckIn: null,
  expectedCheckOut: null,
});

const form = ref(blank());
const attachment = ref(null); // File baru (bila user mengunggah ulang)
const existingAttachment = ref(null); // URL lampiran lama (mode edit, read-only)
const attachmentError = ref("");
const fileInput = ref(null);
const errors = ref({});

// "HH:mm:ss" (dari backend) → "HH:mm" untuk VueDatePicker time-picker.
function toHHMM(t) {
  return t ? String(t).slice(0, 5) : null;
}

function fillForm() {
  const l = props.leave;
  if (l?.id) {
    // Mode edit: prefill dari baris list.
    form.value = {
      leaveTypeId: l.leaveType?.id ?? "",
      date: l.date ?? "",
      reason: l.reason ?? "",
      expectedCheckIn: toHHMM(l.expectedCheckIn),
      expectedCheckOut: toHHMM(l.expectedCheckOut),
    };
    leaveTypeSelected.value = l.leaveType
      ? { id: l.leaveType.id, name: l.leaveType.name }
      : null;
    existingAttachment.value = l.attachment ?? null;
  } else {
    form.value = blank();
    leaveTypeSelected.value = null;
    existingAttachment.value = null;
  }
  attachment.value = null;
  attachmentError.value = "";
  if (fileInput.value) fileInput.value.value = "";
  errors.value = {};
}

watch(() => props.open, (open) => open && fillForm());

function onFileChange(e) {
  attachmentError.value = "";
  const file = e.target.files?.[0] ?? null;
  if (file) {
    const { ok, error } = validateFile(file, { allow: ATTACHMENT_MIME, maxBytes: 10 * MB });
    if (!ok) {
      attachmentError.value = error;
      attachment.value = null;
      if (fileInput.value) fileInput.value.value = "";
      return;
    }
  }
  attachment.value = file;
}

function validate() {
  const f = form.value;
  const next = {};
  if (!auth.employee?.id) next.employee = "Data karyawan akun tidak ditemukan.";
  if (!f.leaveTypeId) next.leaveTypeId = "Tipe izin wajib dipilih.";
  if (!f.date) next.date = "Tanggal wajib diisi.";
  if (!f.reason?.trim()) next.reason = "Alasan wajib diisi.";
  // Backend mensyaratkan jam keluar SEBELUM jam kembali. Bandingkan "HH:mm"
  // secara leksikografis (aman untuk format jam). Hanya bila keduanya diisi.
  if (f.expectedCheckOut && f.expectedCheckIn && f.expectedCheckOut >= f.expectedCheckIn) {
    next.time = "Jam keluar harus sebelum jam kembali.";
  }
  errors.value = next;
  return Object.keys(next).length === 0;
}

// Input type="time" menghasilkan "HH:mm"; backend mengharapkan "HH:mm:ss".
// Tambahkan ":00" bila detik belum ada; "" → null (field opsional).
function toHHMMSS(t) {
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
}

function onSubmit() {
  if (!validate()) return;
  const f = form.value;
  const input = {
    employeeId: auth.employee?.id ?? null,
    leaveTypeId: f.leaveTypeId || null,
    date: f.date || null,
    reason: f.reason?.trim() || null,
    expectedCheckIn: toHHMMSS(f.expectedCheckIn),
    expectedCheckOut: toHHMMSS(f.expectedCheckOut),
    status: "DRAFT", // simpan sebagai draf; dikirim ke persetujuan via submit terpisah
  };
  // Lampiran: sertakan hanya bila ada File baru. Saat edit tanpa unggah ulang,
  // key attachment tidak dikirim agar backend mempertahankan lampiran lama.
  if (attachment.value) input.attachment = attachment.value;
  else if (!isEdit.value) input.attachment = null;

  emit("save", { input, id: props.leave?.id ?? null });
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
    :title="isEdit ? 'Ubah Izin di Jam Kerja' : 'Ajukan Izin di Jam Kerja'"
    size="lg"
    :loading="saving"
    :submit-text="isEdit ? 'Simpan' : 'Simpan Draf'"
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

      <div>
        <label :class="labelCls">Perkiraan Jam Keluar</label>
        <VueDatePicker
          v-model="form.expectedCheckOut"
          time-picker
          :is-24="true"
          model-type="HH:mm"
          format="HH:mm"
          placeholder="--:-- (24 jam)"
          auto-apply
        />
        <p class="mt-1 text-xs text-slate-400">Opsional — jam meninggalkan pekerjaan.</p>
      </div>
      <div>
        <label :class="labelCls">Perkiraan Jam Kembali</label>
        <VueDatePicker
          v-model="form.expectedCheckIn"
          time-picker
          :is-24="true"
          model-type="HH:mm"
          format="HH:mm"
          placeholder="--:-- (24 jam)"
          auto-apply
        />
        <p class="mt-1 text-xs text-slate-400">Opsional — jam kembali bekerja (mis. 15:00 untuk jam 3 sore).</p>
      </div>
      <div v-if="errors.time" class="md:col-span-2 -mt-2">
        <p class="text-xs text-rose-500">{{ errors.time }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Alasan *</label>
        <textarea v-model="form.reason" rows="3" :class="fieldCls" placeholder="Alasan izin meninggalkan pekerjaan"></textarea>
        <p v-if="errors.reason" class="mt-1 text-xs text-rose-500">{{ errors.reason }}</p>
      </div>

      <div class="md:col-span-2">
        <label :class="labelCls">Lampiran</label>
        <p v-if="existingAttachment && !attachment" class="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <PaperClipIcon class="h-4 w-4 shrink-0 text-mahir-primary" />
          <a :href="existingAttachment" target="_blank" rel="noopener noreferrer" class="truncate text-mahir-primary hover:underline">Lampiran saat ini</a>
          <span class="text-slate-400">— unggah berkas baru untuk mengganti.</span>
        </p>
        <input
          ref="fileInput"
          type="file"
          :accept="ATTACHMENT_ACCEPT"
          class="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-mahir-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-mahir-primary hover:file:bg-mahir-primary-soft/80"
          @change="onFileChange"
        />
        <p v-if="attachmentError" class="mt-1 text-xs text-rose-500">{{ attachmentError }}</p>
        <p v-else class="mt-1 text-xs text-slate-400">Opsional — {{ ATTACHMENT_HINT }}. Maks. 10 MB.</p>
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
