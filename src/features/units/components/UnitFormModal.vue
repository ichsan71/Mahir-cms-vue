<script setup>
// Form tambah/ubah unit — kontrak UnitInput backend.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { abbreviatePrefix } from "@/shared/utils/format";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useUnitSearch } from "../composables/useUnitSearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Unit yang sedang diubah (hasil getUnit). null = mode tambah.
  unit: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

// true → unit ini memiliki induk (tampilkan pilihan); false → tanpa induk.
const parent = ref(false);

// Pencarian unit induk (param `search` pada listUnit).
const { options: searchOptions, loading: searchLoading, setSearch } = useUnitSearch();
// Sembunyikan unit itu sendiri dari pilihan induk.
const parentChoices = computed(() =>
  searchOptions.value.filter((u) => String(u.id) !== String(props.unit?.id)),
);
// Induk yang sudah terpilih (untuk menampilkan label langsung saat edit).
const parentSelected = ref(null);

// Mode ubah bila ada unit dengan id valid.
const isEdit = computed(() => !!props.unit?.id);

const blank = () => ({
  name: "",
  unitType: "",
  parentId: "",
});

const form = ref(blank());

// Prefix = singkatan otomatis dari nama unit (helper bersama: membuang simbol &
// mengabaikan kata penghubung seperti dan/and/or). Readonly, sama seperti company.
const prefixAbbr = computed(() => abbreviatePrefix(form.value.name));

// Pilihan tipe unit dari enum backend (UnitTypeChoices) — reusable.
const { options: unitTypeOptions, loading: unitTypeLoading } = useEnumChoices("UnitTypeChoices");

// Field `unitType` pada output backend berupa String biasa (bukan enum), sehingga
// nilainya bisa beda format/kapitalisasi dari value opsi enum ("EXECUTIVE",
// "SUB_DIVISION", …). Normalisasi agar cocok dengan <option> → select terisi saat edit.
function matchUnitType(raw) {
  if (!raw) return "";
  const key = String(raw).trim().toUpperCase().replace(/[\s-]+/g, "_");
  return unitTypeOptions.value.find((o) => o.value.toUpperCase() === key)?.value ?? String(raw);
}

// Isi form dari data unit (mode ubah) atau kosongkan (mode tambah).
// Bila unit sudah punya induk → status "memiliki induk" dengan induk terpilih
// ditampilkan langsung.
function fillForm() {
  const u = props.unit;
  if (u?.id) {
    form.value = {
      name: u.name ?? "",
      unitType: matchUnitType(u.unitType),
      parentId: u.parent?.id ?? "",
    };
    parent.value = !!u.parent;
    parentSelected.value = u.parent ?? null;
  } else {
    form.value = blank();
    parent.value = false;
    parentSelected.value = null;
  }
}

// Isi ulang form saat modal dibuka, dan saat data unit tiba (getUnit async).
watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.unit,
  () => props.open && fillForm(),
);

// Opsi enum tiba async (cache/network). Bila unit sudah terisi lebih dulu,
// resolve ulang unitType agar select tetap cocok saat opsi baru tersedia.
watch(unitTypeOptions, () => {
  if (props.open && props.unit?.id && form.value.unitType) {
    form.value.unitType = matchUnitType(form.value.unitType);
  }
});

// Kosongkan pilihan induk ketika beralih ke "tanpa induk".
watch(parent, (val) => {
  if (!val) {
    form.value.parentId = "";
    parentSelected.value = null;
  }
});

function onSubmit() {
  // Susun payload sesuai UnitInput; kosong → null agar konsisten dengan backend.
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    prefix: prefixAbbr.value || null,
    unitType: f.unitType || null,
    parentId: f.parentId || null,
  };

  emit("save", { id: props.unit?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Unit' : 'Tambah Unit'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label :class="labelCls">Nama Unit *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>
      <div>
        <label :class="labelCls">Tipe Unit *</label>
        <select v-model="form.unitType" required :disabled="unitTypeLoading" :class="fieldCls">
          <option value="">{{ unitTypeLoading ? "Memuat…" : "Pilih tipe unit" }}</option>
          <option v-for="t in unitTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <div>
        <label :class="labelCls">Prefix</label>
        <input
          :value="prefixAbbr || '—'"
          type="text"
          readonly
          class="w-full cursor-not-allowed rounded-lg border border-mahir-border bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-600"
        />
        <p class="mt-1 text-xs text-slate-400">Dibuat otomatis dari nama unit.</p>
      </div>

      <!-- Status induk (menentukan parentId) -->
      <div>
        <label :class="labelCls">Apakah departemen/unit/divisi ini memiliki induk?</label>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input v-model="parent" type="radio" :value="true" class="text-mahir-primary focus:ring-mahir-primary" />
            Ya
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input v-model="parent" type="radio" :value="false" class="text-mahir-primary focus:ring-mahir-primary" />
            Tidak
          </label>
        </div>
      </div>

      <!-- Unit Induk (parentId) — muncul bila memiliki induk -->
      <div v-if="parent">
        <label :class="labelCls">Unit Induk *</label>
        <SearchableSelect
          v-model="form.parentId"
          :selected="parentSelected"
          :options="parentChoices"
          :loading="searchLoading"
          placeholder="Pilih unit induk"
          search-placeholder="Cari unit…"
          @search="setSearch"
        />
      </div>
    </div>
  </BaseModal>
</template>
