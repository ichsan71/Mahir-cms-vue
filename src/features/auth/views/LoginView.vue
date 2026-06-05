<script setup>
// Port dari resources/views/pages/auth/login.blade.php + layouts/auth.blade.php
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

const { login, error, loading } = useAuth();

const email = ref("admin@maztagroup.com");
const password = ref("password");
const remember = ref(false);
const showPwd = ref(false);

function submit() {
  login({ email: email.value, password: password.value });
}

const features = [
  { icon: "bi-people-fill", color: "#4D7BFF", title: "Manajemen Karyawan", sub: "Data terpusat & terstruktur" },
  { icon: "bi-calendar2-check", color: "#1B9C67", title: "Monitoring Kehadiran", sub: "Realtime & akurat" },
  { icon: "bi-cash-stack", color: "#D98E18", title: "Penggajian Otomatis", sub: "Slip gaji digital" },
  { icon: "bi-file-earmark-text", color: "#2884E8", title: "Cuti & Izin Digital", sub: "Approval workflow cepat" },
];
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Brand side -->
    <div class="hidden w-[43%] flex-col justify-between bg-mahir-sidebar-bg p-12 lg:flex">
      <div>
        <div class="mb-10 flex items-center gap-3">
          <div class="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#243B8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <div class="font-display text-[15px] font-extrabold text-white">MAHIR</div>
            <div class="text-[10px] tracking-wider text-white/45">MAZTA GROUP · HRIS</div>
          </div>
        </div>

        <div class="mb-8">
          <h1 class="font-display text-[28px] font-bold leading-snug text-white">
            Human Resource<br />Management System
          </h1>
          <p class="mt-2 text-sm leading-relaxed text-white/55">
            Kelola seluruh sumber daya manusia Mazta Group dalam satu platform terpadu — efisien,
            transparan, dan andal.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="f in features" :key="f.title" class="flex items-center gap-3">
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.08]">
              <i class="bi text-base" :class="f.icon" :style="{ color: f.color }"></i>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-white">{{ f.title }}</div>
              <div class="text-xs text-white/45">{{ f.sub }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-[11px] text-white/30">© 2026 Mazta Group · Seluruh hak dilindungi</div>
    </div>

    <!-- Form side -->
    <div class="flex flex-1 flex-col items-center justify-center bg-mahir-bg p-8">
      <div class="w-full max-w-[440px] rounded-[20px] border border-slate-200 bg-white p-9 shadow-sm">
        <div class="mb-6 text-center">
          <div class="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-mahir-primary-soft">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#243B8F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h2 class="font-display text-[22px] font-extrabold text-slate-900">Masuk ke MAHIR</h2>
          <p class="mt-1 text-[13px] text-mahir-muted">Gunakan akun yang diberikan oleh Administrator</p>
        </div>

        <div
          v-if="error"
          class="mb-4 flex items-center gap-2 rounded-lg bg-mahir-danger-soft px-3 py-2 text-[13px] text-mahir-danger"
        >
          <i class="bi bi-exclamation-circle-fill"></i> {{ error }}
        </div>

        <form @submit.prevent="submit">
          <!-- Email -->
          <div class="mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700">Email / NIP</label>
            <div class="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-mahir-primary">
              <span class="flex items-center px-3 text-slate-400"><i class="bi bi-envelope"></i></span>
              <input
                v-model="email"
                type="email"
                required
                autofocus
                placeholder="nama@maztagroup.com"
                class="w-full border-0 py-2 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="mb-3">
            <div class="mb-1 flex items-center justify-between">
              <label class="text-sm font-medium text-slate-700">Password</label>
              <a href="#" class="text-xs text-mahir-primary">Lupa password?</a>
            </div>
            <div class="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-mahir-primary">
              <span class="flex items-center px-3 text-slate-400"><i class="bi bi-lock"></i></span>
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full border-0 py-2 text-sm focus:outline-none"
              />
              <button type="button" class="px-3 text-slate-400" @click="showPwd = !showPwd">
                <i class="bi" :class="showPwd ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Remember -->
          <label class="mb-4 flex items-center gap-2 text-[13px] text-slate-700">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
            Ingat saya selama 30 hari
          </label>

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-mahir-primary py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:opacity-60"
          >
            <i v-if="!loading" class="bi bi-box-arrow-in-right"></i>
            <i v-else class="bi bi-arrow-repeat animate-spin"></i>
            {{ loading ? "Memproses…" : "Masuk" }}
          </button>
        </form>

        <div class="mt-5 border-t border-slate-200 pt-4 text-center">
          <div class="text-xs text-slate-400">— atau masuk dengan —</div>
          <button
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-[13.5px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google SSO
          </button>
        </div>
      </div>
      <p class="mt-4 text-xs text-slate-400">
        Butuh bantuan?
        <a href="mailto:support@maztagroup.com" class="text-mahir-primary">Hubungi IT Support</a>
      </p>
    </div>
  </div>
</template>
