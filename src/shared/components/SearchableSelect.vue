<script setup>
// Select dengan pencarian async. Komponen induk yang menjalankan query
// (lewat event "search"); komponen ini hanya menampilkan opsi & seleksi.
// Dropdown dirender inline (bukan absolute) agar tidak terpotong oleh
// kontainer modal yang overflow-y-auto.
import { ref, watch } from "vue";
import {
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: null },
  // Item terpilih saat ini: 
  // - Mode Single: { id, name }
  // - Mode Multiple: [{ id, name }, ...]
  selected: { type: [Object, Array], default: null },
  options: { type: Array, default: () => [] }, // [{ id, name }]
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "Pilih…" },
  searchPlaceholder: { type: String, default: "Ketik untuk mencari…" },
  disabled: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false }, // 👈 Tambahkan prop multiple
});

const emit = defineEmits(["update:modelValue", "search"]);

const open = ref(false);
const query = ref("");
// Inisialisasi selectedItem berdasarkan apakah mode multiple aktif atau tidak
const selectedItem = ref(props.multiple ? (props.selected || []) : props.selected);

// Sinkronkan label terpilih bila induk mengubah `selected` (mis. prefill edit).
watch(
  () => props.selected,
  (v) => {
    selectedItem.value = props.multiple ? (v || []) : v;
  },
  { deep: true }
);

let timeoutId = null;
function onInput() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => emit("search", query.value.trim()), 350);
}

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    query.value = "";
    emit("search", ""); // muat daftar awal
  }
}

function choose(opt) {
  if (props.multiple) {
    // Pastikan selectedItem.value berupa array
    const currentItems = Array.isArray(selectedItem.value) ? [...selectedItem.value] : [];
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

    const index = currentValues.findIndex((val) => String(val) === String(opt.id));

    if (index > -1) {
      // Jika sudah ada, hapus (unselect)
      currentValues.splice(index, 1);
      currentItems.splice(index, 1);
    } else {
      // Jika belum ada, tambahkan (select)
      currentValues.push(opt.id);
      currentItems.push(opt);
    }

    selectedItem.value = currentItems;
    emit("update:modelValue", currentValues);
    // Pada mode multiple, dropdown tidak ditutup secara otomatis agar user bisa memilih item lain
  } else {
    // Logika Single Select bawaan Anda
    selectedItem.value = opt;
    emit("update:modelValue", opt.id);
    open.value = false;
  }
}

// Menghapus item tertentu (digunakan untuk tag badge di mode multiple)
function removeTrack(opt) {
  if (!props.multiple) return;
  const currentItems = Array.isArray(selectedItem.value) ? [...selectedItem.value] : [];
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

  const index = currentValues.findIndex((val) => String(val) === String(opt.id));
  if (index > -1) {
    currentValues.splice(index, 1);
    currentItems.splice(index, 1);
    selectedItem.value = currentItems;
    emit("update:modelValue", currentValues);
  }
}

function clear() {
  if (props.multiple) {
    selectedItem.value = [];
    emit("update:modelValue", []);
  } else {
    selectedItem.value = null;
    emit("update:modelValue", null);
  }
}

// Fungsi pembantu untuk mengecek apakah suatu opsi sedang terpilih
function isSelected(optId) {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.some((val) => String(val) === String(optId));
  }
  return String(optId) === String(props.modelValue);
}

const controlCls =
  "flex w-full flex-wrap items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-1.5 text-sm";
</script>

<template>
  <div>
    <div
      :class="[controlCls, disabled ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer']"
      @click="toggle"
    >
      <template v-if="multiple">
        <div v-if="selectedItem && selectedItem.length" class="flex flex-wrap gap-1 max-w-[90%]">
          <span 
            v-for="item in selectedItem" 
            :key="item.id" 
            class="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 border border-slate-200"
          >
            {{ item.name }}
            <button 
              v-if="!disabled"
              type="button" 
              class="text-slate-400 hover:text-slate-600 focus:outline-none"
              @click.stop="removeTrack(item)"
            >
              <XMarkIcon class="h-3 w-3" />
            </button>
          </span>
        </div>
        <span v-else class="truncate text-slate-400 py-0.5">{{ placeholder }}</span>
      </template>

      <template v-else>
        <span v-if="selectedItem" class="truncate text-slate-800 py-0.5">{{ selectedItem.name }}</span>
        <span v-else class="truncate text-slate-400 py-0.5">{{ placeholder }}</span>
      </template>

      <button
        v-if="((multiple && selectedItem?.length) || (!multiple && selectedItem)) && !disabled"
        type="button"
        class="ml-auto flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        title="Kosongkan semua"
        @click.stop="clear"
      >
        <XMarkIcon class="h-3 w-3" />
      </button>

      <ChevronDownIcon
        class="h-4 w-4 text-slate-400 transition-transform"
        :class="[(multiple ? selectedItem?.length : selectedItem) ? '' : 'ml-auto', { 'rotate-180': open }]"
      />
    </div>

    <div v-if="open" class="mt-1 overflow-hidden rounded-lg border border-mahir-border">
      <div class="border-b border-mahir-border p-2">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            v-model="query"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full rounded-md border border-mahir-border py-1.5 pl-8 pr-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
            @input="onInput"
          />
        </div>
      </div>

      <ul class="max-h-48 overflow-y-auto py-1 text-sm">
        <li v-if="loading" class="px-3 py-2 text-center text-slate-400">Memuat…</li>
        <li v-else-if="!options.length" class="px-3 py-2 text-center text-slate-400">
          Tidak ada hasil.
        </li>
        <li
          v-for="opt in options"
          :key="opt.id"
          class="cursor-pointer truncate px-3 py-2 hover:bg-slate-50 flex justify-between items-center"
          :class="isSelected(opt.id) ? 'bg-mahir-primary-soft font-medium text-mahir-primary' : 'text-slate-700'"
          @click="choose(opt)"
        >
          <span>{{ opt.name }}</span>
          <CheckIcon v-if="multiple && isSelected(opt.id)" class="h-4 w-4" />
        </li>
      </ul>
    </div>
  </div>
</template>