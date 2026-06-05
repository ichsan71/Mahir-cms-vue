<script setup>
// Form pengajuan cuti/izin (port dari x-modal-form addLeaveModal)
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "save"]);

const EMPLOYEES = [
  "Rizky Aditya", "Sari Dewi", "Budi Santoso", "Dinda Larasati",
  "Fajar Nugroho", "Hana Putri", "Ivan Prasetyo", "Jeny Kusuma",
];
const TYPES = ["Cuti Tahunan", "Izin Sakit", "Izin Pribadi", "Izin Mendesak", "Cuti Bersama"];

const blank = () => ({ emp: "", type: "", from: "", to: "", reason: "" });
const form = ref(blank());

watch(
  () => props.open,
  (open) => {
    if (open) form.value = blank();
  },
);

// Hitung jumlah hari inklusif dari rentang tanggal
function diffDays(from, to) {
  if (!from || !to) return 1;
  const d = Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
  return d > 0 ? d : 1;
}

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function onSubmit() {
  emit("save", {
    emp: form.value.emp,
    type: form.value.type,
    from: fmt(form.value.from),
    to: fmt(form.value.to),
    days: diffDays(form.value.from, form.value.to),
    reason: form.value.reason,
  });
}

const fieldCls = "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Tambah Pengajuan Cuti / Izin"
    size="md"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <label :class="labelCls">Karyawan *</label>
        <select v-model="form.emp" required :class="fieldCls">
          <option value="">Pilih karyawan</option>
          <option v-for="e in EMPLOYEES" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label :class="labelCls">Jenis Cuti *</label>
        <select v-model="form.type" required :class="fieldCls">
          <option value="">Pilih jenis</option>
          <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div>
        <label :class="labelCls">Dari *</label>
        <input v-model="form.from" type="date" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Sampai *</label>
        <input v-model="form.to" type="date" required :class="fieldCls" />
      </div>
      <div class="md:col-span-2">
        <label :class="labelCls">Keterangan</label>
        <textarea v-model="form.reason" rows="3" placeholder="Alasan pengajuan..." :class="fieldCls"></textarea>
      </div>
    </div>
  </BaseModal>
</template>
