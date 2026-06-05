<script setup>
// Port dari resources/views/partials/navbar.blade.php
import { ref, computed } from "vue";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useAuth } from "@/features/auth/composables/useAuth";
import { initials } from "@/shared/utils/format";

defineProps({
  title: { type: String, default: "Dashboard" },
});

const ui = useUiStore();
const auth = useAuthStore();
const { logout } = useAuth();
const menuOpen = ref(false);

const userName = computed(() => auth.user?.name || "Admin");
const userRole = computed(() => auth.user?.role || "Super Admin");
const userEmail = computed(() => auth.user?.email || "admin@maztagroup.com");
const userInitials = computed(() => initials(userName.value));
</script>

<template>
  <header
    class="sticky top-0 z-[1020] flex h-[60px] items-center justify-between border-b border-mahir-border bg-white px-4 lg:px-6"
  >
    <div class="flex items-center gap-3">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Toggle sidebar"
        @click="ui.toggleSidebar"
      >
        <i class="bi bi-list text-lg"></i>
      </button>

      <!-- Breadcrumb -->
      <nav class="hidden text-sm md:block">
        <ol class="flex items-center gap-2">
          <li class="text-slate-500">MAHIR CMS</li>
          <li class="text-slate-300">/</li>
          <li class="font-medium text-slate-900">{{ title }}</li>
        </ol>
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <!-- Search -->
      <div class="hidden lg:block">
        <div class="relative w-[220px]">
          <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
          <input
            type="text"
            placeholder="Cari..."
            class="w-full rounded-lg border border-mahir-border bg-white py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
      </div>

      <!-- Notification -->
      <button
        class="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Notifikasi"
      >
        <i class="bi bi-bell"></i>
        <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-mahir-danger"></span>
      </button>

      <!-- User menu -->
      <div class="relative">
        <button
          class="flex items-center gap-2"
          @click="menuOpen = !menuOpen"
          @blur="menuOpen = false"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
            >{{ userInitials }}</span
          >
          <div class="hidden text-left leading-tight md:block">
            <div class="text-[13px] font-semibold text-slate-900">{{ userName }}</div>
            <div class="text-[11px] text-slate-400">{{ userRole }}</div>
          </div>
          <i class="bi bi-chevron-down hidden text-[11px] text-slate-400 md:block"></i>
        </button>

        <Transition name="fade">
          <ul
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-mahir-border bg-white py-1 text-sm shadow-lg"
          >
            <li class="border-b border-mahir-border px-4 py-2">
              <div class="font-semibold">{{ userName }}</div>
              <div class="text-xs text-slate-400">{{ userEmail }}</div>
            </li>
            <li>
              <RouterLink class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50" to="/pengaturan"
                ><i class="bi bi-person"></i> Profil Saya</RouterLink
              >
            </li>
            <li>
              <RouterLink class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50" to="/pengaturan"
                ><i class="bi bi-gear"></i> Pengaturan</RouterLink
              >
            </li>
            <li class="border-t border-mahir-border">
              <button
                class="flex w-full items-center gap-2 px-4 py-2 text-left text-mahir-danger hover:bg-slate-50"
                @mousedown.prevent="logout"
              >
                <i class="bi bi-box-arrow-left"></i> Keluar
              </button>
            </li>
          </ul>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
