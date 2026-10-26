<script setup>
// Form tambah/ubah komponen penggajian — kontrak SalaryComponentTypeInput.
// Semua field sudah tersedia di LIST query, jadi prefill langsung dari baris list.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";

// Pilihan kategori dari enum backend SALARY_COMPONENT_CATEGORY.
// options => [{ value, label }]; value yang dikirim = nama enum (mis. "BASIC").
const { options: categoryOptions } = useEnumChoices("SALARY_COMPONENT_CATEGORY");

// Angka acak 4 digit (0000–9999).
function randomNum(digits = 4) {
  return String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, "0");
}

// Inisial tiap kata (maks 4 huruf), mis. "Gaji Pokok" => "GP".
function toInitials(name) {
  const clean = String(name || "")
    .normalize("NFKD")
    .replace(/[^\w\s]+/g, "")
    .trim();
  if (!clean) return "";
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

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

// Angka acak 4 digit, dikunci sekali tiap kali modal tambah dibuka agar tidak
// berganti-ganti saat mengetik nama; hanya inisial yang mengikuti nama.
const codeSuffix = ref(randomNum());

function fillForm() {
  const s = props.componentType;
  if (!s?.id) codeSuffix.value = randomNum();
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

// Kode auto dari nama HANYA saat tambah (read-only di UI): inisial nama + angka
// acak 4 digit yang terkunci. mis. "Gaji Pokok" => "GP4172". Saat edit, kode lama
// dipertahankan dan tidak bisa diubah.
watch(() => form.value.name, (name) => {
  if (isEdit.value) return;
  const initials = toInitials(name);
  form.value.code = initials ? `${initials}${codeSuffix.value}` : "";
});

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
          <input
            v-model="form.code"
            type="text"
            required
            readonly
            :class="[fieldCls, 'cursor-not-allowed bg-slate-50 text-slate-500']"
            placeholder="Otomatis dari nama"
          />
          <span class="mt-1 block text-[12px] text-mahir-muted">Dibuat otomatis dari nama komponen.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Kategori *</label>
          <select v-model="form.category" required :class="fieldCls">
            <option value="" disabled>Pilih kategori</option>
            <option v-for="c in categoryOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
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

      <div>
        <label :class="labelCls">Sifat komponen</label>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        </div>
      </div>

      <!-- Status aktif: saklar untuk menghidupkan/menonaktifkan komponen ini. -->
      <div>
        <label :class="labelCls">Status komponen</label>
        <div
          class="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors"
          :class="form.isActive ? 'border-emerald-200 bg-emerald-50/60' : 'border-mahir-border bg-slate-50'"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-2.5 w-2.5 rounded-full"
              :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-400'"
            />
            <span>
              <span class="block text-sm font-semibold" :class="form.isActive ? 'text-emerald-700' : 'text-slate-600'">
                {{ form.isActive ? "Aktif" : "Nonaktif" }}
              </span>
              <span class="block text-[12px] text-mahir-muted">
                {{
                  form.isActive
                    ? "Komponen aktif dan dapat dipakai pada struktur gaji."
                    : "Komponen dimatikan — tidak bisa dipilih pada struktur gaji."
                }}
              </span>
            </span>
          </div>

          <button
            type="button"
            role="switch"
            :aria-checked="form.isActive"
            aria-label="Aktifkan komponen penggajian"
            @click="form.isActive = !form.isActive"
            class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-mahir-primary focus:ring-offset-2"
            :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-300'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              :class="form.isActive ? 'translate-x-[22px]' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
