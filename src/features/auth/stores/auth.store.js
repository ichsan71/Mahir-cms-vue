import { defineStore } from "pinia";
import { ref, computed } from "vue";

// State autentikasi global, dipersistensi ke localStorage agar sesi bertahan refresh.
export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("mahir_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("mahir_user") || "null"));
  const employee = ref(JSON.parse(localStorage.getItem("mahir_employee") || "null"));

  const isAuthenticated = computed(() => !!token.value);

  // Himpunan nama operasi GraphQL yang boleh dijalankan user, dari
  // `user.userPermissions` (mis. `listEmployee`). Dipakai untuk lookup O(1) di can().
  const permissionSet = computed(() => new Set(user.value?.userPermissions || []));

  /**
   * Apakah user boleh menjalankan sebuah operasi. Gating di frontend hanya untuk
   * UX — API tetap yang menegakkan akses — jadi ini sekadar menyembunyikan aksi
   * yang tak boleh dipakai. Superuser selalu diizinkan.
   * @param {string|string[]} perm Nama operasi, atau daftar (true jika ADA yang cocok).
   */
  function can(perm) {
    if (user.value?.isSuperuser) return true;
    if (Array.isArray(perm)) return perm.some((p) => permissionSet.value.has(p));
    return permissionSet.value.has(perm);
  }

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

  return { token, user, employee, isAuthenticated, permissionSet, can, displayName, displayRole, setSession, logout };
});
