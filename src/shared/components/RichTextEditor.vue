<script setup>
// Editor teks kaya (rich text) berbasis CKEditor 5.
// Butuh dependency: `@ckeditor/ckeditor5-vue` dan `ckeditor5`
// (jalankan `npm install` — lihat package.json).
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Tulis isi di sini…" },
});
const emit = defineEmits(["update:modelValue"]);

const editor = ClassicEditor;

function buildConfig(placeholder) {
  return {
    plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Link, List, BlockQuote],
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "link",
      "|",
      "bulletedList",
      "numberedList",
      "blockQuote",
      "|",
      "undo",
      "redo",
    ],
    placeholder,
  };
}
</script>

<template>
  <div class="mahir-ckeditor">
    <Ckeditor
      :editor="editor"
      :config="buildConfig(placeholder)"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
/* Samakan radius/tinggi dengan kontrol form Mahir. */
.mahir-ckeditor :deep(.ck-editor__editable) {
  min-height: 220px;
}
.mahir-ckeditor :deep(.ck.ck-editor__main > .ck-editor__editable),
.mahir-ckeditor :deep(.ck.ck-toolbar) {
  border-color: #e2e8f0;
}
.mahir-ckeditor :deep(.ck.ck-toolbar) {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
.mahir-ckeditor :deep(.ck.ck-editor__main > .ck-editor__editable) {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>
