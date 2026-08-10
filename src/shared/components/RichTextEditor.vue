<script setup>
// Editor teks kaya (rich text) berbasis Quill (@vueup/vue-quill).
// Dipilih menggantikan CKEditor 5 karena jauh lebih ringan sehingga build
// production tidak berat. Kontrak komponen sengaja dijaga sama: v-model
// (modelValue String berisi HTML) + prop placeholder.
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Tulis isi di sini…" },
});
const emit = defineEmits(["update:modelValue"]);

// Toolbar disamakan dengan set fitur editor lama: heading, bold, italic,
// underline, link, list (berurut & bullet), blockquote, plus bersihkan format.
const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  ["link", "blockquote"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["clean"],
];
</script>

<template>
  <div class="mahir-quill">
    <QuillEditor
      :content="modelValue"
      content-type="html"
      :toolbar="toolbar"
      :placeholder="placeholder"
      theme="snow"
      @update:content="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
/* Samakan radius/tinggi/border dengan kontrol form Mahir. */
.mahir-quill :deep(.ql-toolbar),
.mahir-quill :deep(.ql-container) {
  border-color: #e2e8f0;
}
.mahir-quill :deep(.ql-toolbar) {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.mahir-quill :deep(.ql-container) {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  font-size: 0.875rem;
}
.mahir-quill :deep(.ql-editor) {
  min-height: 220px;
}
/* Placeholder mengikuti warna muted form. */
.mahir-quill :deep(.ql-editor.ql-blank::before) {
  color: #94a3b8;
  font-style: normal;
}
</style>
