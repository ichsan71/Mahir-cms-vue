<script setup>
// Halaman set password pertama kali setelah aktivasi akun.
// Backend mengaktifkan akun lewat link email, lalu redirect ke
// /verify-email?token=<internal_token> (token "employee" 7 hari). Halaman ini
// menangkap token itu dan memakainya untuk mengatur password pertama kali.
//
// Catatan: tidak ada flag "must_change_password" di backend — kewajiban set
// password hanya ditegakkan oleh UX ini. Karena itu halaman ini publik dan
// langsung menampilkan form set password begitu token valid ada di URL.
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import logoUrl from "@/assets/mahir-logo 1-2.png";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const { setPasswordWithToken, loading } = useAuth();

// Token aktivasi dari query string (?token=...).
const token = ref(route.query.token || "");

const newPassword = ref("");
const confirmPassword = ref("");
const showPwd = ref(false);
const showConfirm = ref(false);
const submitted = ref(false);

const MIN_LEN = 8;

// Validasi ringan di sisi frontend (backend tetap penentu akhir).
const passwordError = computed(() => {
  if (!newPassword.value) return "";
  if (newPassword.value.length < MIN_LEN) return `Minimal ${MIN_LEN} karakter`;
  return "";
});
const confirmError = computed(() => {
  if (!confirmPassword.value) return "";
  if (confirmPassword.value !== newPassword.value) return "Konfirmasi password tidak cocok";
  return "";
});
const canSubmit = computed(
  () =>
    !!token.value &&
    newPassword.value.length >= MIN_LEN &&
    confirmPassword.value === newPassword.value &&
    !loading.value,
);

onMounted(() => {
  // Tanpa token, halaman ini tidak ada gunanya — arahkan info ke user.
  if (!token.value) return;
});

async function submit() {
  if (!canSubmit.value) return;
  const ok = await setPasswordWithToken({
    token: token.value,
    newPassword: newPassword.value,
  });
  if (ok) {
    submitted.value = true;
    // Beri jeda singkat agar toast sukses terbaca sebelum pindah ke login.
    setTimeout(() => router.push("/login"), 1500);
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-mahir-bg p-8">
    <div class="w-full max-w-[440px]">
      <!-- Token tidak ada di URL -->
      <div
        v-if="!token"
        class="rounded-[20px] border border-slate-200 bg-white p-9 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ExclamationTriangleIcon class="h-7 w-7 text-red-500" />
        </div>
        <h2 class="font-display text-[20px] font-extrabold text-slate-900">Link Tidak Valid</h2>
        <p class="mt-2 text-[13px] text-mahir-muted">
          Token aktivasi tidak ditemukan pada tautan ini. Silakan buka kembali tautan aktivasi dari
          email Anda, atau hubungi Administrator.
        </p>
        <router-link
          to="/login"
          class="mt-5 inline-block rounded-lg bg-mahir-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90"
        >
          Ke Halaman Masuk
        </router-link>
      </div>

      <!-- Sukses -->
      <div
        v-else-if="submitted"
        class="rounded-[20px] border border-slate-200 bg-white p-9 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircleIcon class="h-7 w-7 text-green-600" />
        </div>
        <h2 class="font-display text-[20px] font-extrabold text-slate-900">Password Berhasil Diatur</h2>
        <p class="mt-2 text-[13px] text-mahir-muted">
          Anda akan diarahkan ke halaman masuk. Gunakan password baru Anda untuk login.
        </p>
      </div>

      <!-- Form set password -->
      <div v-else class="rounded-[20px] border border-slate-200 bg-white p-9 shadow-sm">
        <div class="mb-6 text-center">
          <div
            class="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] bg-white ring-1 ring-slate-100"
          >
            <img :src="logoUrl" alt="MAHIR" class="h-full w-full object-contain p-1" />
          </div>
          <h2 class="font-display text-[22px] font-extrabold text-slate-900">Atur Password Baru</h2>
          <p class="mt-1 text-[13px] text-mahir-muted">
            Akun Anda telah aktif. Buat password untuk mulai menggunakan MAHIR.
          </p>
        </div>

        <form @submit.prevent="submit">
          <!-- Password baru -->
          <div class="mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
            <div
              class="flex overflow-hidden rounded-lg border focus-within:border-mahir-primary"
              :class="passwordError ? 'border-red-400' : 'border-slate-300'"
            >
              <span class="flex items-center px-3 text-slate-400"><LockClosedIcon class="h-4 w-4" /></span>
              <input
                v-model="newPassword"
                :type="showPwd ? 'text' : 'password'"
                required
                autofocus
                :placeholder="`Minimal ${MIN_LEN} karakter`"
                class="w-full border-0 py-2 text-sm focus:outline-none"
              />
              <button type="button" class="px-3 text-slate-400" @click="showPwd = !showPwd">
                <component :is="showPwd ? EyeSlashIcon : EyeIcon" class="h-4 w-4" />
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-xs text-red-500">{{ passwordError }}</p>
          </div>

          <!-- Konfirmasi password -->
          <div class="mb-5">
            <label class="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
            <div
              class="flex overflow-hidden rounded-lg border focus-within:border-mahir-primary"
              :class="confirmError ? 'border-red-400' : 'border-slate-300'"
            >
              <span class="flex items-center px-3 text-slate-400"><LockClosedIcon class="h-4 w-4" /></span>
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                required
                placeholder="Ulangi password baru"
                class="w-full border-0 py-2 text-sm focus:outline-none"
                @keyup.enter="submit"
              />
              <button type="button" class="px-3 text-slate-400" @click="showConfirm = !showConfirm">
                <component :is="showConfirm ? EyeSlashIcon : EyeIcon" class="h-4 w-4" />
              </button>
            </div>
            <p v-if="confirmError" class="mt-1 text-xs text-red-500">{{ confirmError }}</p>
          </div>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-mahir-primary py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:opacity-60"
          >
            <ArrowPathIcon v-if="loading" class="h-4 w-4 animate-spin" />
            {{ loading ? "Menyimpan…" : "Simpan Password" }}
          </button>
        </form>
      </div>

      <p class="mt-4 text-center text-xs text-slate-400">
        Butuh bantuan?
        <a href="mailto:support@maztagroup.com" class="text-mahir-primary">Hubungi IT Support</a>
      </p>
    </div>
  </div>
</template>
