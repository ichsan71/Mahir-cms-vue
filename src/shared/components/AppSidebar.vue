<script setup>
// Port dari resources/views/partials/sidebar.blade.php
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui.store";
import { useAuth } from "@/features/auth/composables/useAuth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Squares2X2Icon,
  UsersIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  IdentificationIcon,
  ClockIcon,
  ShareIcon,
  ChartBarIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserPlusIcon,
  PresentationChartLineIcon,
  ChevronDownIcon,
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";

const ui = useUiStore();
const route = useRoute();
const { logout } = useAuth();
const auth = useAuthStore();

// Item dengan `children` dirender sebagai accordion.
// `permissions` = daftar operasi GraphQL yang dipakai halaman itu; item tampil
// bila user punya SALAH SATU izinnya (sembunyi hanya bila tak punya satu pun).
// Item tanpa `permissions` selalu tampil.
const navItems = [
  { to: "/dashboard", icon: Squares2X2Icon, label: "Dashboard" },
  {
    key: "data-induk",
    icon: UsersIcon,
    label: "Data Induk",
    superOnly: true, // Master data hanya untuk super admin.
    children: [
      { to: "/perusahaan", icon: BuildingOffice2Icon, label: "Perusahaan", permissions: ["listCompany", "getCompany"] },
      { to: "/cabang", icon: MapPinIcon, label: "Cabang", permissions: ["listBranch", "getBranch"] },
      { to: "/karyawan", icon: IdentificationIcon, label: "Karyawan", permissions: ["listEmployee", "getEmployee"] },
      { to: "/tipe-kepegawaian", icon: IdentificationIcon, label: "Tipe Karyawan", permissions: ["listEmploymentType", "getEmploymentType"] },
      { to: "/shift", icon: ClockIcon, label: "Shift", permissions: ["listShift", "getShift"] },
      { to: "/unit", icon: ShareIcon, label: "Unit", permissions: ["listUnit", "getUnit"] },
      { to: "/level", icon: ChartBarIcon, label: "Level", permissions: ["listLevel", "getLevel"] },
    ],
  },
  // Menu operasional masih "Soon" (belum aktif) — ditampilkan disabled ke semua.
  { icon: BanknotesIcon, label: "Penggajian", soon: true },
  { icon: CalendarDaysIcon, label: "Kehadiran", soon: true },
  { icon: DocumentTextIcon, label: "Cuti & Izin", soon: true },
  { icon: UserPlusIcon, label: "Rekrutmen", soon: true },
  { icon: PresentationChartLineIcon, label: "Laporan", soon: true },
  // Profil sendiri — tampil hanya bila akun tertaut data employee (superuser: null).
  { to: "/saya", icon: UserCircleIcon, label: "Profil Saya" },
];

// Nav terfilter permission: buang item yang tak diizinkan, lalu buang grup yang
// jadi kosong. Item tanpa `permissions` (Dashboard, Profil Saya) selalu tampil.
const visibleNavItems = computed(() =>
  navItems
    // Item `superOnly` (Data Induk) hanya untuk super admin.
    .filter((item) => !item.superOnly || auth.user?.isSuperuser)
    .map((item) => {
      if (!item.children) return item;
      return { ...item, children: item.children.filter((c) => !c.permissions || auth.can(c.permissions)) };
    })
    .filter((item) => !item.children || item.children.length > 0)
    .filter((item) => item.children || !item.permissions || auth.can(item.permissions))
    // Profil Saya hanya untuk akun yang tertaut employee (superuser employee=null).
    .filter((item) => item.to !== "/saya" || !!auth.employee),
);

// Accordion yang sedang terbuka. Buka otomatis grup yang memuat rute aktif.
function groupHasActive(item) {
  return (item.children ?? []).some((c) => c.to && route.path.startsWith(c.to));
}

const openGroups = ref(
  navItems.filter((i) => i.children && groupHasActive(i)).map((i) => i.key),
);

function toggleGroup(key) {
  openGroups.value = openGroups.value.includes(key)
    ? openGroups.value.filter((k) => k !== key)
    : [...openGroups.value, key];
}

const isOpen = (key) => openGroups.value.includes(key);

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

      <template v-for="item in visibleNavItems" :key="item.key || item.label">
        <!-- Grup accordion -->
        <div v-if="item.children">
          <button
            type="button"
            :class="[linkBase, inactive, 'w-full text-left']"
            @click="toggleGroup(item.key)"
          >
            <component :is="item.icon" class="h-[18px] w-[18px] opacity-70" />
            <span>{{ item.label }}</span>
            <ChevronDownIcon
              class="ml-auto h-3.5 w-3.5 opacity-60 transition-transform"
              :class="{ 'rotate-180': isOpen(item.key) }"
            />
          </button>

          <div v-show="isOpen(item.key)" class="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-2">
            <RouterLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              :class="[linkBase, inactive, 'py-2']"
              active-class="!bg-mahir-sidebar-active !text-white"
              @click="ui.closeMobile"
            >
              <component :is="child.icon" class="h-[18px] w-[18px] opacity-70" />
              <span>{{ child.label }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- Item 'Soon' (belum aktif, tidak bisa diklik) -->
        <div
          v-else-if="item.soon"
          :class="[linkBase, 'text-white/40 cursor-not-allowed select-none']"
        >
          <component :is="item.icon" class="h-[18px] w-[18px] opacity-70" />
          <span>{{ item.label }}</span>
          <span
            class="ml-auto rounded bg-orange-400 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-black"
          >
            Soon
          </span>
        </div>

        <!-- Item tunggal (link aktif) -->
        <RouterLink
          v-else
          :to="item.to"
          :class="[linkBase, inactive]"
          active-class="!bg-mahir-sidebar-active !text-white"
          @click="ui.closeMobile"
        >
          <component :is="item.icon" class="h-[18px] w-[18px] opacity-70" />
          <span>{{ item.label }}</span>

          <span
            v-if="item.badge"
            class="ml-auto rounded-full bg-white/10 px-1.5 py-px text-[10px] font-bold text-white/60"
          >
            {{ item.badge }}
          </span>
        </RouterLink>
      </template>

      <div class="mx-3 my-2 h-px bg-white/10"></div>

      <!-- menu pengaturan di disable sementara -->
      <!-- <div class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
        Pengaturan
      </div>

      <RouterLink
        to="/pengaturan"
        :class="[linkBase, inactive]"
        active-class="!bg-mahir-sidebar-active !text-white"
        @click="ui.closeMobile"
      >
        <Cog6ToothIcon class="h-[18px] w-[18px] opacity-70" />
        <span>Pengaturan</span>
      </RouterLink> -->
      <!-- end menu pengaturan -->
       
      <button :class="[linkBase, inactive, 'w-full text-left']" @click="logout">
        <ArrowLeftStartOnRectangleIcon class="h-[18px] w-[18px] opacity-70" />
        <span>Keluar</span>
      </button>
    </div>
  </nav>
</template>
