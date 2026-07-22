<script setup>
// Port dari resources/views/pages/auth/login.blade.php + layouts/auth.blade.php
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";
import logoUrl from "@/assets/mahir-logo 1-2.png";
import {
  UsersIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  DocumentTextIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const { login, loading } = useAuth();

const username = ref("");
const password = ref("");
const remember = ref(false);
const showPwd = ref(false);

function submit() {
  login({ username: username.value, password: password.value });
}

const features = [
  { icon: UsersIcon, color: "#4D7BFF", title: "Manajemen Karyawan", sub: "Data terpusat & terstruktur", isDev : false },
  { icon: CalendarDaysIcon, color: "#1B9C67", title: "Monitoring Kehadiran", sub: "Realtime & akurat", isDev : true },
  { icon: BanknotesIcon, color: "#D98E18", title: "Penggajian Otomatis", sub: "Slip gaji digital", isDev : true },
  { icon: DocumentTextIcon, color: "#2884E8", title: "Cuti & Izin Digital", sub: "Approval workflow cepat", isDev:true },
];
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Brand side -->
    <div class="hidden w-[43%] flex-col justify-between bg-mahir-sidebar-bg p-12 lg:flex">
      <div>
        <div class="mb-10 flex items-center gap-3">
          <div class="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-[10px] bg-white">
            <img :src="logoUrl" alt="MAHIR" class="h-full w-full object-contain p-0.5" />
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
          <div 
            v-for="f in features" 
            :key="f.title" 
            class="flex items-center gap-3 transition-opacity duration-200"
            :class="{ 'opacity-50': f.isDev }"
          >
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.08]">
              <component :is="f.icon" class="h-4 w-4" :style="{ color: f.color }" />
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-white">{{ f.title }}</span>
                <span 
                  v-if="f.isDev" 
                  class="rounded bg-orange-600 px-1.5 py-0.5 text-[9px] font-medium tracking-wider text-white/60 uppercase"
                >
                  SOON
                </span>
              </div>
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
          <div class="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[14px] bg-white ring-1 ring-slate-100">
            <img :src="logoUrl" alt="MAHIR" class="h-full w-full object-contain p-1" />
          </div>
          <h2 class="font-display text-[22px] font-extrabold text-slate-900">Masuk ke MAHIR</h2>
          <p class="mt-1 text-[13px] text-mahir-muted">Gunakan akun yang diberikan oleh Administrator</p>
        </div>

        <form @submit.prevent="submit">
          <!-- Username -->
          <div class="mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <div class="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-mahir-primary">
              <span class="flex items-center px-3 text-slate-400"><UserIcon class="h-4 w-4" /></span>
              <input
                v-model="username"
                type="text"
                required
                autofocus
                placeholder="username Anda"
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
              <span class="flex items-center px-3 text-slate-400"><LockClosedIcon class="h-4 w-4" /></span>
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full border-0 py-2 text-sm focus:outline-none"
              />
              <button type="button" class="px-3 text-slate-400" @click="showPwd = !showPwd">
                <component :is="showPwd ? EyeSlashIcon : EyeIcon" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Remember -->
          <!-- <label class="mb-4 flex items-center gap-2 text-[13px] text-slate-700">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
            Ingat saya selama 30 hari
          </label> -->

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-mahir-primary py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:opacity-60"
          >
            <ArrowRightEndOnRectangleIcon v-if="!loading" class="h-4 w-4" />
            <ArrowPathIcon v-else class="h-4 w-4 animate-spin" />
            {{ loading ? "Memproses…" : "Masuk" }}
          </button>
        </form>
      </div>
      <p class="mt-4 text-xs text-slate-400">
        Butuh bantuan?
        <a href="mailto:support@maztagroup.com" class="text-mahir-primary">Hubungi IT Support</a>
      </p>
    </div>
  </div>
</template>
