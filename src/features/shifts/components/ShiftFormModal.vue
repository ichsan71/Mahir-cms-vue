<script setup>
// Form tambah/ubah shift — kontrak ShiftInput baru:
// name, startTime, endTime, breakStart, breakEnd, isFlexible,
// lateTolerance, earlyLeaveTolerance.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useShiftDetail } from "../composables/useShiftDetail";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Shift yang sedang diubah (baris list hanya membawa id/name/jam). null = mode tambah.
  shift: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.shift?.id);

// Saat edit, ambil data lengkap (break, toleransi, isFlexible) yang tak ada di baris list.
const editId = computed(() => (props.open && props.shift?.id ? props.shift.id : null));
const { shift: fullShift } = useShiftDetail(editId);

const blank = () => ({
  name: "",
  isFlexible: false,
  startTime: "",
  endTime: "",
  breakStart: "",
  breakEnd: "",
  lateTolerance: "",
  earlyLeaveTolerance: "",
});

const form = ref(blank());

// Normalisasi jam ke "HH:MM" agar cocok dengan input type="time".
function toHHMM(t) {
  return t ? String(t).slice(0, 5) : "";
}

// Angka toleransi (menit) → string untuk input, "" bila kosong.
function toNumStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function fillForm() {
  // Utamakan data lengkap dari GET_SHIFT; fallback ke baris list untuk tampil cepat.
  const s = fullShift.value ?? props.shift;
  form.value = props.shift?.id
    ? {
        name: s.name ?? "",
        isFlexible: !!s.isFlexible,
        startTime: toHHMM(s.startTime),
        endTime: toHHMM(s.endTime),
        breakStart: toHHMM(s.breakStart),
        breakEnd: toHHMM(s.breakEnd),
        lateTolerance: toNumStr(s.lateTolerance),
        earlyLeaveTolerance: toNumStr(s.earlyLeaveTolerance),
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

// Menit → integer atau null.
function toMinutes(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function onSubmit() {
  const f = form.value;
  const flexible = !!f.isFlexible;
  const input = {
    name: f.name?.trim() || null,
    isFlexible: flexible,
    // Shift fleksibel tak punya jam tetap → seluruh field jadwal dikosongkan.
    startTime: flexible ? null : f.startTime || null,
    endTime: flexible ? null : f.endTime || null,
    breakStart: flexible ? null : f.breakStart || null,
    breakEnd: flexible ? null : f.breakEnd || null,
    lateTolerance: flexible ? null : toMinutes(f.lateTolerance),
    earlyLeaveTolerance: flexible ? null : toMinutes(f.earlyLeaveTolerance),
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
      <div class="md:col-span-2">
        <label
          class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3"
        >
          <input v-model="form.isFlexible" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Shift Fleksibel</span>
            <span class="block text-[12px] text-mahir-muted">
              Tanpa jam masuk/pulang tetap. Jadwal, istirahat, dan toleransi tidak diperlukan.
            </span>
          </span>
        </label>
      </div>

      <!-- Field jadwal tetap — sembunyi saat fleksibel -->
      <template v-if="!form.isFlexible">
        <div>
          <label :class="labelCls">Jam Mulai *</label>
          <input v-model="form.startTime" type="time" required :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Jam Selesai *</label>
          <input v-model="form.endTime" type="time" required :class="fieldCls" />
        </div>

        <div>
          <label :class="labelCls">Istirahat Mulai</label>
          <input v-model="form.breakStart" type="time" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Istirahat Selesai</label>
          <input v-model="form.breakEnd" type="time" :class="fieldCls" />
        </div>

        <div>
          <label :class="labelCls">Toleransi Terlambat (Detik)</label>
          <input v-model="form.lateTolerance" type="number" min="0" :class="fieldCls" placeholder="0" />
        </div>
        <div>
          <label :class="labelCls">Toleransi Pulang Cepat (Detik)</label>
          <input
            v-model="form.earlyLeaveTolerance"
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
