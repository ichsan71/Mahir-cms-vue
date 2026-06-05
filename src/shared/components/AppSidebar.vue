<script setup>
// Port dari resources/views/partials/sidebar.blade.php
import { RouterLink } from "vue-router";
import { useUiStore } from "@/stores/ui.store";
import { useAuth } from "@/features/auth/composables/useAuth";

const ui = useUiStore();
const { logout } = useAuth();

const navItems = [
  { to: "/dashboard", icon: "bi-grid-1x2-fill", label: "Dashboard" },
  { to: "/karyawan", icon: "bi-people-fill", label: "Karyawan" },
  { to: "/penggajian", icon: "bi-cash-stack", label: "Penggajian" },
  { to: "/kehadiran", icon: "bi-calendar2-check", label: "Kehadiran" },
  { to: "/cuti", icon: "bi-file-earmark-text", label: "Cuti & Izin", badge: 3 },
  { to: "/rekrutmen", icon: "bi-person-plus-fill", label: "Rekrutmen" },
  { to: "/laporan", icon: "bi-bar-chart-line-fill", label: "Laporan" },
];

const linkBase =
  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors";
const inactive = "text-white/75 hover:bg-white/5 hover:text-white";
</script>

<template>
  <!-- Overlay (mobile) -->
  <div
    v-if="ui.mobileOpen"
    class="fixed inset-0 z-[1030] bg-slate-900/50 lg:hidden"
    @click="ui.closeMobile"
  ></div>

  <nav
    class="sidebar-scroll fixed inset-y-0 left-0 z-[1040] flex w-[260px] flex-col overflow-y-auto bg-mahir-sidebar-bg transition-transform duration-200 lg:translate-x-0"
    :class="ui.mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Header -->
    <div
      class="flex h-[60px] flex-shrink-0 items-center gap-3 border-b border-white/10 bg-mahir-sidebar-hdr px-5"
    >
      <div class="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] bg-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="#243B8F"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div>
        <div class="font-display text-[15px] font-extrabold leading-tight text-white">MAHIR</div>
        <div class="text-[10px] tracking-wider text-white/45">MAZTA GROUP</div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex flex-1 flex-col gap-0.5 p-2">
      <div class="px-3 pb-1 pt-3.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
        Menu Utama
      </div>

      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        :class="[linkBase, inactive]"
        active-class="!bg-mahir-sidebar-active !text-white"
        @click="ui.closeMobile"
      >
        <i class="bi w-[18px] opacity-70" :class="item.icon"></i>
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="ml-auto rounded-full bg-white/10 px-1.5 py-px text-[10px] font-bold text-white/60"
          >{{ item.badge }}</span
        >
      </RouterLink>

      <div class="mx-3 my-2 h-px bg-white/10"></div>
      <div class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
        Pengaturan
      </div>

      <RouterLink
        to="/pengaturan"
        :class="[linkBase, inactive]"
        active-class="!bg-mahir-sidebar-active !text-white"
        @click="ui.closeMobile"
      >
        <i class="bi bi-gear-fill w-[18px] opacity-70"></i>
        <span>Pengaturan</span>
      </RouterLink>
      <button :class="[linkBase, inactive, 'w-full text-left']" @click="logout">
        <i class="bi bi-box-arrow-left w-[18px] opacity-70"></i>
        <span>Keluar</span>
      </button>
    </div>
  </nav>
</template>
