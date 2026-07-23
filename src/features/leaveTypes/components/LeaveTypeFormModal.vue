<script setup>
// Form tambah/ubah tipe cuti — kontrak LeaveTypeInput (name, isPaid).
// Field GET lain (code, description, needReason, dst.) ditampilkan di halaman
// detail; belum ada di input sesuai kontrak yang diberikan.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
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

const blank = () => ({
  name: "",
  isPaid: false,
});

const form = ref(blank());

function fillForm() {
  const s = fullType.value ?? props.leaveType;
  form.value = props.leaveType?.id
    ? {
        name: s.name ?? "",
        isPaid: !!s.isPaid,
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.leaveType, () => props.open && fillForm());
// Data lengkap tiba async → prefill ulang.
watch(fullType, () => props.open && fillForm());

function onSubmit() {
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    isPaid: !!f.isPaid,
  };
  emit("save", { id: props.leaveType?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Tipe Cuti' : 'Tambah Tipe Cuti'"
    size="md"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div>
        <label :class="labelCls">Nama Tipe Cuti *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Cuti Tahunan" />
      </div>

      <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
        <input v-model="form.isPaid" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">Cuti berbayar</span>
          <span class="block text-[12px] text-mahir-muted">
            Karyawan tetap menerima gaji selama menjalani cuti jenis ini.
          </span>
        </span>
      </label>
    </div>
  </BaseModal>
</template>
