import { defineStore } from "pinia";
import { ref, computed } from "vue";

// State autentikasi global, dipersistensi ke localStorage agar sesi bertahan refresh.
export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("mahir_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("mahir_user") || "null"));

  const isAuthenticated = computed(() => !!token.value);

  function setSession({ token: t, user: u }) {
    token.value = t;
    user.value = u;
    localStorage.setItem("mahir_token", t);
    localStorage.setItem("mahir_user", JSON.stringify(u));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("mahir_token");
    localStorage.removeItem("mahir_user");
  }

  return { token, user, isAuthenticated, setSession, logout };
});
