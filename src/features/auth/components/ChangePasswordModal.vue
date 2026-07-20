<script setup>
// Form ubah password akun sendiri. Memvalidasi di sisi klien (password baru
// terisi, minimal 8 karakter, cocok dengan konfirmasi, dan berbeda dari lama)
// lalu meneruskan { oldPassword, newPassword } ke parent lewat event "submit".
import { ref, watch } from "vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import BaseModal from "@/shared/components/BaseModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "submit"]);

const blank = () => ({ oldPassword: "", newPassword: "", confirmPassword: "" });
const form = ref(blank());
const formError = ref("");
const show = ref({ old: false, new: false, confirm: false });

// Reset isian & error setiap kali modal dibuka.
watch(
  () => props.open,
  (open) => {
    if (open) {
      form.value = blank();
      formError.value = "";
      show.value = { old: false, new: false, confirm: false };
    }
  },
);

function onSubmit() {
  const f = form.value;
  formError.value = "";

  if (!f.oldPassword || !f.newPassword || !f.confirmPassword) {
    formError.value = "Semua kolom wajib diisi.";
    return;
  }
  if (f.newPassword.length < 8) {
    formError.value = "Password baru minimal 8 karakter.";
    return;
  }
  if (f.newPassword !== f.confirmPassword) {
    formError.value = "Konfirmasi password tidak cocok.";
    return;
  }
  if (f.newPassword === f.oldPassword) {
    formError.value = "Password baru harus berbeda dari password lama.";
    return;
  }

  emit("submit", { oldPassword: f.oldPassword, newPassword: f.newPassword });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 pr-10 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const toggleCls = "absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600";
</script>

<template>
  <BaseModal
    :open="open"
    title="Ubah Password"
    size="md"
    :loading="saving"
    submit-text="Ubah Password"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <p class="text-[13px] text-slate-500">
        Setelah password berhasil diubah, Anda akan keluar otomatis dan perlu masuk
        kembali menggunakan password baru.
      </p>

      <div>
        <label :class="labelCls">Password Lama *</label>
        <div class="relative">
          <input
            v-model="form.oldPassword"
            :type="show.old ? 'text' : 'password'"
            autocomplete="current-password"
            :class="fieldCls"
          />
          <button type="button" :class="toggleCls" @click="show.old = !show.old">
            <EyeSlashIcon v-if="show.old" class="h-4 w-4" />
            <EyeIcon v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label :class="labelCls">Password Baru *</label>
        <div class="relative">
          <input
            v-model="form.newPassword"
            :type="show.new ? 'text' : 'password'"
            autocomplete="new-password"
            :class="fieldCls"
          />
          <button type="button" :class="toggleCls" @click="show.new = !show.new">
            <EyeSlashIcon v-if="show.new" class="h-4 w-4" />
            <EyeIcon v-else class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-1 text-xs text-slate-400">Minimal 8 karakter.</p>
      </div>

      <div>
        <label :class="labelCls">Konfirmasi Password Baru *</label>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="show.confirm ? 'text' : 'password'"
            autocomplete="new-password"
            :class="fieldCls"
          />
          <button type="button" :class="toggleCls" @click="show.confirm = !show.confirm">
            <EyeSlashIcon v-if="show.confirm" class="h-4 w-4" />
            <EyeIcon v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <p v-if="formError" class="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
        {{ formError }}
      </p>
    </div>
  </BaseModal>
</template>
