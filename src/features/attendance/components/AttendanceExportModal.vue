<script setup>
// Form ekspor data kehadiran. Rentang tanggal (dateFrom/dateTo) memfilter
// tanggal kehadiran yang diekspor; hasil ekspor dikirim ke `email`.
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import DateRangeField from "@/shared/components/DateRangeField.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "submit"]);

// Email tujuan sengaja dikosongkan — user mengisi sendiri.
const blank = () => ({ dateFrom: "", dateTo: "", email: "" });
const form = ref(blank());
const dateError = ref("");

// Isi ulang setiap kali modal dibuka agar tidak menyimpan input lama.
watch(
  () => props.open,
  (open) => {
    if (open) {
      form.value = blank();
      dateError.value = "";
    }
  },
);

function onSubmit() {
  dateError.value = "";
  const { dateFrom, dateTo } = form.value;
  // Rentang tanggal opsional, tapi bila keduanya diisi urutannya harus valid.
  if (dateFrom && dateTo && dateFrom > dateTo) {
    dateError.value = "Tanggal awal tidak boleh melebihi tanggal akhir.";
    return;
  }
  emit("submit", {
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    email: form.value.email.trim(),
  });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Ekspor Data Kehadiran"
    size="md"
    :loading="saving"
    submit-text="Kirim ke Email"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <p class="text-sm text-mahir-muted">
        Data kehadiran akan diproses dan dikirim sebagai berkas ke email tujuan. Kosongkan rentang
        tanggal untuk mengekspor seluruh data kehadiran.
      </p>

      <div>
        <label :class="labelCls">Rentang Tanggal Kehadiran</label>
        <DateRangeField v-model:from="form.dateFrom" v-model:to="form.dateTo" />
      </div>
      <p v-if="dateError" class="-mt-2 text-sm text-red-600">{{ dateError }}</p>

      <div>
        <label :class="labelCls">Kirim ke Email *</label>
        <input
          v-model="form.email"
          type="email"
          required
          :class="fieldCls"
          placeholder="nama@maztafarma.co.id"
        />
        <p class="mt-1 text-xs text-mahir-muted">Hasil ekspor akan dikirim ke alamat email ini.</p>
      </div>
    </div>
  </BaseModal>
</template>
