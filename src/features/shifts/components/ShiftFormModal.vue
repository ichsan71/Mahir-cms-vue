<script setup>
// Form tambah/ubah shift — kontrak ShiftInput baru:
// name, startTime, endTime, breakStart, breakEnd,
// flexibleByPlace, flexibleByWorkingHours, requiredHours, requiredHoursPeriod.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useShiftDetail } from "../composables/useShiftDetail";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";

// Pilihan periode target jam kerja dari enum backend (introspeksi) — tipe `RequiredHoursPeriod`.
const { options: periodOptions, loading: periodLoading } = useEnumChoices("RequiredHoursPeriod");

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Shift yang sedang diubah (baris list hanya membawa id/name/jam). null = mode tambah.
  shift: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.shift?.id);

// Saat kedua mode fleksibel aktif, tak ada jadwal & lokasi tetap sebagai acuan,
// sehingga target jam + periodenya wajib diisi sebagai satu-satunya patokan kerja.
const targetRequired = computed(
  () => !!form.value.flexibleByWorkingHours && !!form.value.flexibleByPlace,
);

// Saat edit, ambil data lengkap (break, fleksibel, target jam) yang tak ada di baris list.
const editId = computed(() => (props.open && props.shift?.id ? props.shift.id : null));
const { shift: fullShift } = useShiftDetail(editId);

const blank = () => ({
  name: "",
  flexibleByPlace: false,
  flexibleByWorkingHours: false,
  startTime: "",
  endTime: "",
  breakStart: "",
  breakEnd: "",
  requiredHours: "",
  requiredHoursPeriod: "",
});

const form = ref(blank());

// Normalisasi jam ke "HH:MM" agar cocok dengan input type="time".
function toHHMM(t) {
  return t ? String(t).slice(0, 5) : "";
}

// Nilai apa pun → string untuk input, "" bila kosong.
function toStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function fillForm() {
  // Utamakan data lengkap dari GET_SHIFT; fallback ke baris list untuk tampil cepat.
  const s = fullShift.value ?? props.shift;
  form.value = props.shift?.id
    ? {
        name: s.name ?? "",
        flexibleByPlace: !!s.flexibleByPlace,
        flexibleByWorkingHours: !!s.flexibleByWorkingHours,
        startTime: toHHMM(s.startTime),
        endTime: toHHMM(s.endTime),
        breakStart: toHHMM(s.breakStart),
        breakEnd: toHHMM(s.breakEnd),
        requiredHours: toStr(s.requiredHours),
        requiredHoursPeriod: s.requiredHoursPeriod ?? "",
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.shift,
  () => props.open && fillForm(),
);
// Data lengkap tiba belakangan (async) → prefill ulang agar break/toleransi terisi.
watch(fullShift, () => props.open && fillForm());

// Saat jam kerja fleksibel dicentang, kosongkan jadwal yang mungkin sudah terisi
// agar nilai lama tak ikut terkirim atau muncul lagi saat toggle dimatikan.
watch(
  () => form.value.flexibleByWorkingHours,
  (flexible) => {
    if (!flexible) return;
    form.value.startTime = "";
    form.value.endTime = "";
    form.value.breakStart = "";
    form.value.breakEnd = "";
  },
);

function onSubmit() {
  const f = form.value;
  const flexibleHours = !!f.flexibleByWorkingHours;
  const input = {
    name: f.name?.trim() || null,
    flexibleByPlace: !!f.flexibleByPlace,
    flexibleByWorkingHours: flexibleHours,
    // Jam kerja fleksibel → tak ada jam tetap, seluruh field jadwal dikosongkan.
    startTime: flexibleHours ? null : f.startTime || null,
    endTime: flexibleHours ? null : f.endTime || null,
    breakStart: flexibleHours ? null : f.breakStart || null,
    breakEnd: flexibleHours ? null : f.breakEnd || null,
    requiredHours: String(f.requiredHours ?? "").trim() || null,
    requiredHoursPeriod: f.requiredHoursPeriod || null,
  };
  emit("save", { id: props.shift?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Shift' : 'Tambah Shift'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <label :class="labelCls">Nama Shift *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Shift Pagi" />
      </div>

      <!-- Toggle fleksibel -->
      <div class="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label
          class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3"
        >
          <input v-model="form.flexibleByWorkingHours" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Jam Kerja Fleksibel</span>
            <span class="block text-[12px] text-mahir-muted">
              Karyawan bebas mengatur jam kerja selama memenuhi target jam.
            </span>
          </span>
        </label>
        <label
          class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3"
        >
          <input v-model="form.flexibleByPlace" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Lokasi Fleksibel</span>
            <span class="block text-[12px] text-mahir-muted">
              Karyawan bebas bekerja dari lokasi mana pun.
            </span>
          </span>
        </label>
      </div>

      <!-- Field jadwal tetap — sembunyi saat jam kerja fleksibel -->
      <template v-if="!form.flexibleByWorkingHours">
        <div>
          <label :class="labelCls">Jam Mulai</label>
          <input v-model="form.startTime" type="time" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Jam Selesai</label>
          <input v-model="form.endTime" type="time" :class="fieldCls" />
        </div>

        <div>
          <label :class="labelCls">Istirahat Mulai</label>
          <input v-model="form.breakStart" type="time" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Istirahat Selesai</label>
          <input v-model="form.breakEnd" type="time" :class="fieldCls" />
        </div>
      </template>

      <div>
        <label :class="labelCls">Target Jam Kerja <span v-if="targetRequired" class="text-red-500">*</span></label>
        <input
          v-model="form.requiredHours"
          type="number"
          min="0"
          :required="targetRequired"
          :class="fieldCls"
          placeholder="mis. 8"
        />
      </div>
      <div>
        <label :class="labelCls">Periode Target Jam <span v-if="targetRequired" class="text-red-500">*</span></label>
        <select
          v-model="form.requiredHoursPeriod"
          :disabled="periodLoading"
          :required="targetRequired"
          :class="fieldCls"
        >
          <option value="">{{ periodLoading ? "Memuat…" : "— Pilih periode —" }}</option>
          <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- Penjelasan kenapa target jam jadi wajib saat kedua mode fleksibel aktif -->
      <p v-if="targetRequired" class="md:col-span-2 -mt-1 text-[12px] text-mahir-muted">
        Karena Jam Kerja Fleksibel dan Lokasi Fleksibel keduanya aktif, Target Jam Kerja dan Periode Target Jam wajib diisi sebagai patokan kerja karyawan.
      </p>
    </div>
  </BaseModal>
</template>
