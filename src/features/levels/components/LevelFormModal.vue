<script setup>
// Form tambah/ubah level — kontrak LevelInput backend (name, parentId).
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useLevelSearch } from "../composables/useLevelSearch";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Level yang sedang diubah (hasil getLevel). null = mode tambah.
  level: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

// true → level ini memiliki induk (tampilkan pilihan); false → tanpa induk.
const parent = ref(false);

// Pencarian level induk (param `search` pada listLevel).
const { options: searchOptions, loading: searchLoading, setSearch } = useLevelSearch();
// Sembunyikan level itu sendiri dari pilihan induk.
const parentChoices = computed(() =>
  searchOptions.value.filter((l) => String(l.id) !== String(props.level?.id)),
);
// Induk yang sudah terpilih (untuk menampilkan label langsung saat edit).
const parentSelected = ref(null);

// Pilihan tipe level dari enum backend (LevelTypeChoices) — reusable.
const { options: levelTypeOptions, loading: levelTypeLoading } = useEnumChoices("LevelTypeChoices");

// Mode ubah bila ada level dengan id valid.
const isEdit = computed(() => !!props.level?.id);

const blank = () => ({ name: "", levelType: "", parentId: "" });

const form = ref(blank());

// Isi form dari data level (mode ubah) atau kosongkan (mode tambah).
// Bila level sudah punya induk → status "memiliki induk" dengan induk terpilih
// ditampilkan langsung.
function fillForm() {
  const l = props.level;
  if (l?.id) {
    form.value = { name: l.name ?? "", levelType: l.levelType ?? "", parentId: l.parent?.id ?? "" };
    parent.value = !!l.parent;
    parentSelected.value = l.parent ?? null;
  } else {
    form.value = blank();
    parent.value = false;
    parentSelected.value = null;
  }
}

// Isi ulang form saat modal dibuka, dan saat data level tiba (getLevel async).
watch(() => props.open, (open) => open && fillForm());
watch(
  () => props.level,
  () => props.open && fillForm(),
);

// Kosongkan pilihan induk ketika beralih ke "tanpa induk".
watch(parent, (val) => {
  if (!val) {
    form.value.parentId = "";
    parentSelected.value = null;
  }
});

function onSubmit() {
  const f = form.value;
  const input = {
    name: f.name?.trim() || null,
    levelType: f.levelType || null,
    parentId: parent.value ? f.parentId || null : null,
  };
  emit("save", { id: props.level?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Level' : 'Tambah Level'"
    size="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label :class="labelCls">Nama Level *</label>
        <input v-model="form.name" type="text" required :class="fieldCls" />
      </div>

      <div>
        <label :class="labelCls">Tipe Level *</label>
        <select v-model="form.levelType" required :disabled="levelTypeLoading" :class="fieldCls">
          <option value="">{{ levelTypeLoading ? "Memuat…" : "Pilih tipe level" }}</option>
          <option v-for="t in levelTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>

      <!-- Status induk (menentukan parentId) -->
      <div>
        <label :class="labelCls">Apakah level ini memiliki induk?</label>
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

      <!-- Level Induk (parentId) — muncul bila memiliki induk -->
      <div v-if="parent">
        <label :class="labelCls">Level Induk *</label>
        <SearchableSelect
          v-model="form.parentId"
          :selected="parentSelected"
          :options="parentChoices"
          :loading="searchLoading"
          placeholder="Pilih level induk"
          search-placeholder="Cari level…"
          @search="setSearch"
        />
      </div>
    </div>
  </BaseModal>
</template>
