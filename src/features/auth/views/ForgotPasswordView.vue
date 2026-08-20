<script setup>
// Halaman publik "Lupa Password". User cukup memasukkan email; backend yang
// mengurus sisanya (mengirim tautan reset bila email terdaftar). Setelah
// backend membalas success, tampilkan konfirmasi bahwa email telah dikirim.
import { ref, computed } from "vue";
import { useAuth } from "../composables/useAuth";
import logoUrl from "@/assets/mahir-logo 1-2.png";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/vue/24/outline";

const { forgotPassword, loading } = useAuth();

const email = ref("");
const submitted = ref(false);

// Validasi ringan di sisi frontend (backend tetap penentu akhir).
const emailError = computed(() => {
  if (!email.value) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return "Format email tidak valid";
  return "";
});
const canSubmit = computed(() => !!email.value && !emailError.value && !loading.value);

async function submit() {
  if (!canSubmit.value) return;
  const ok = await forgotPassword({ email: email.value });
  if (ok) submitted.value = true;
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-mahir-bg p-8">
    <div class="w-full max-w-[440px]">
      <!-- Sukses: email terkirim -->
      <div
        v-if="submitted"
        class="rounded-[20px] border border-slate-200 bg-white p-9 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircleIcon class="h-7 w-7 text-green-600" />
        </div>
        <h2 class="font-display text-[20px] font-extrabold text-slate-900">Periksa Email Anda</h2>
        <p class="mt-2 text-[13px] text-mahir-muted">
          Bila email <span class="font-medium text-slate-700">{{ email }}</span> terdaftar, kami
          telah mengirimkan tautan untuk mengatur ulang password. Silakan periksa kotak masuk
          (dan folder spam) Anda.
        </p>
        <router-link
          to="/login"
          class="mt-5 inline-block rounded-lg bg-mahir-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90"
        >
          Kembali ke Halaman Masuk
        </router-link>
      </div>

      <!-- Form minta tautan reset -->
      <div v-else class="rounded-[20px] border border-slate-200 bg-white p-9 shadow-sm">
        <div class="mb-6 text-center">
          <div
            class="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] bg-white ring-1 ring-slate-100"
          >
            <img :src="logoUrl" alt="MAHIR" class="h-full w-full object-contain p-1" />
          </div>
          <h2 class="font-display text-[22px] font-extrabold text-slate-900">Lupa Password</h2>
          <p class="mt-1 text-[13px] text-mahir-muted">
            Masukkan email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang password.
          </p>
        </div>

        <form @submit.prevent="submit">
          <!-- Email -->
          <div class="mb-5">
            <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <div
              class="flex overflow-hidden rounded-lg border focus-within:border-mahir-primary"
              :class="emailError ? 'border-red-400' : 'border-slate-300'"
            >
              <span class="flex items-center px-3 text-slate-400"><EnvelopeIcon class="h-4 w-4" /></span>
              <input
                v-model="email"
                type="email"
                required
                autofocus
                placeholder="email Anda"
                class="w-full border-0 py-2 pr-3 text-sm focus:outline-none"
              />
            </div>
            <p v-if="emailError" class="mt-1 text-xs text-red-500">{{ emailError }}</p>
          </div>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-mahir-primary py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:opacity-60"
          >
            <ArrowPathIcon v-if="loading" class="h-4 w-4 animate-spin" />
            <PaperAirplaneIcon v-else class="h-4 w-4" />
            {{ loading ? "Mengirim…" : "Kirim Tautan Reset" }}
          </button>
        </form>

        <router-link
          to="/login"
          class="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-mahir-primary hover:underline"
        >
          <ArrowLeftIcon class="h-3.5 w-3.5" />
          Kembali ke Halaman Masuk
        </router-link>
      </div>

      <p class="mt-4 text-center text-xs text-slate-400">
        Butuh bantuan?
        <a href="mailto:support@maztagroup.com" class="text-mahir-primary">Hubungi IT Support</a>
      </p>
    </div>
  </div>
</template>
