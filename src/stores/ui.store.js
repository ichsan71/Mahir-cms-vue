import { defineStore } from "pinia";
import { ref } from "vue";

// Global UI state — dipakai bersama oleh AppSidebar & AppNavbar.
export const useUiStore = defineStore("ui", () => {
  // Sidebar collapsed (desktop) & open (mobile drawer)
  const collapsed = ref(false);
  const mobileOpen = ref(false);

  function toggleSidebar() {
    if (window.innerWidth < 992) {
      mobileOpen.value = !mobileOpen.value;
    } else {
      collapsed.value = !collapsed.value;
    }
  }

  function closeMobile() {
    mobileOpen.value = false;
  }

  return { collapsed, mobileOpen, toggleSidebar, closeMobile };
});
