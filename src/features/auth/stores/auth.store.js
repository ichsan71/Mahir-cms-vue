import { defineStore } from "pinia";
import { ref, computed } from "vue";

// State autentikasi global, dipersistensi ke localStorage agar sesi bertahan refresh.
export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("mahir_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("mahir_user") || "null"));
  const employee = ref(JSON.parse(localStorage.getItem("mahir_employee") || "null"));

  const isAuthenticated = computed(() => !!token.value);

  // Nama tampilan & jabatan diturunkan dari data employee (fallback ke user).
  const displayName = computed(
    () => employee.value?.fullName || user.value?.username || "Pengguna",
  );
  const displayRole = computed(() => employee.value?.level?.name || "Karyawan");

  // payload = { token, user, employee } hasil mutation login.
  function setSession({ token: t, user: u, employee: e }) {
    token.value = t;
    user.value = u;
    employee.value = e;
    localStorage.setItem("mahir_token", t);
    localStorage.setItem("mahir_user", JSON.stringify(u));
    localStorage.setItem("mahir_employee", JSON.stringify(e));
  }

  function logout() {
    token.value = null;
    user.value = null;
    employee.value = null;
    localStorage.removeItem("mahir_token");
    localStorage.removeItem("mahir_user");
    localStorage.removeItem("mahir_employee");
  }

  return { token, user, employee, isAuthenticated, displayName, displayRole, setSession, logout };
});
