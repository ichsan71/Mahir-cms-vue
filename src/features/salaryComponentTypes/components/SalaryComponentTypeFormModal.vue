<script setup>
// Form tambah/ubah komponen penggajian — kontrak SalaryComponentTypeInput.
// Semua field sudah tersedia di LIST query, jadi prefill langsung dari baris list.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { CATEGORIES } from "../constants";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Komponen yang sedang diubah (baris list). null = mode tambah.
  componentType: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.componentType?.id);

const blank = () => ({
  name: "",
  code: "",
  category: "",
  isTaxable: false,
  isFixed: false,
  isProrated: false,
  forfeitIfLateMinutes: "",
  isActive: true,
});

const form = ref(blank());

function fillForm() {
  const s = props.componentType;
  form.value = s?.id
    ? {
        name: s.name ?? "",
        code: s.code ?? "",
        category: s.category ?? "",
        isTaxable: !!s.isTaxable,
        isFixed: !!s.isFixed,
        isProrated: !!s.isProrated,
        forfeitIfLateMinutes: s.forfeitIfLateMinutes ?? "",
        isActive: s.isActive ?? true,
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.componentType, () => props.open && fillForm());

function onSubmit() {
  const f = form.value;
  const forfeit = f.forfeitIfLateMinutes === "" || f.forfeitIfLateMinutes === null
    ? null
    : Number(f.forfeitIfLateMinutes);
  const input = {
    name: f.name?.trim() || null,
    code: f.code?.trim() || null,
    category: f.category || null,
    isTaxable: !!f.isTaxable,
    isFixed: !!f.isFixed,
    isProrated: !!f.isProrated,
    forfeitIfLateMinutes: forfeit,
    isActive: !!f.isActive,
  };
  emit("save", { id: props.componentType?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const toggleCls = "flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Komponen Penggajian' : 'Tambah Komponen Penggajian'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Nama Komponen *</label>
          <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Gaji Pokok" />
        </div>
        <div>
          <label :class="labelCls">Kode *</label>
          <input v-model="form.code" type="text" required :class="fieldCls" placeholder="mis. BASIC" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Kategori *</label>
          <select v-model="form.category" required :class="fieldCls">
            <option value="" disabled>Pilih kategori</option>
            <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div>
          <label :class="labelCls">Hangus bila telat (menit)</label>
          <input
            v-model="form.forfeitIfLateMinutes"
            type="number"
            min="0"
            :class="fieldCls"
            placeholder="Kosongkan bila tidak berlaku"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label :class="toggleCls">
          <input v-model="form.isTaxable" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Kena pajak</span>
            <span class="block text-[12px] text-mahir-muted">Komponen ini dihitung sebagai objek pajak.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.isFixed" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Tetap</span>
            <span class="block text-[12px] text-mahir-muted">Nilainya tetap tiap periode, bukan variabel.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.isProrated" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Prorata</span>
            <span class="block text-[12px] text-mahir-muted">Disesuaikan dengan hari kerja/kehadiran.</span>
          </span>
        </label>

        <label :class="toggleCls">
          <input v-model="form.isActive" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Aktif</span>
            <span class="block text-[12px] text-mahir-muted">Komponen dapat dipakai pada struktur gaji.</span>
          </span>
        </label>
      </div>
    </div>
  </BaseModal>
</template>
