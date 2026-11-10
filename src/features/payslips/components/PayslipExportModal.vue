<script setup>
// Form ekspor slip gaji. Hasil (CSV/XLSX) diproses async & dikirim ke email.
// Ekspor mengikuti filter yang sedang aktif pada daftar (diteruskan oleh parent).
import { ref, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "submit"]);

const email = ref("");
const format = ref("XLSX"); // "XLSX" | "CSV"

watch(
  () => props.open,
  (open) => {
    if (open) {
      email.value = "";
      format.value = "XLSX";
    }
  },
);

function onSubmit() {
  if (!email.value.trim()) return;
  emit("submit", { email: email.value.trim(), format: format.value });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Ekspor Slip Gaji"
    size="md"
    :loading="saving"
    submit-text="Kirim ke Email"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <p class="text-sm text-mahir-muted">
        Slip gaji (mengikuti filter daftar yang aktif) akan diproses dan dikirim sebagai berkas ke
        email tujuan.
      </p>

      <div>
        <label :class="labelCls">Format Berkas</label>
        <select v-model="format" :class="fieldCls">
          <option value="XLSX">Excel (XLSX)</option>
          <option value="CSV">CSV</option>
        </select>
      </div>

      <div>
        <label :class="labelCls">Kirim ke Email *</label>
        <input
          v-model="email"
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
