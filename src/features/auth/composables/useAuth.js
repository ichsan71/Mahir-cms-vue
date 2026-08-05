import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { LOGIN, LOGOUT, CHANGE_PASSWORD } from "../graphql/auth.queries";
import { useAuthStore } from "../stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { apolloClient } from "@/apollo/client";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message ||
    e?.networkError?.message ||
    e?.message ||
    "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika autentikasi: login (GraphQL) + logout + state error/loading.
export function useAuth() {
  const auth = useAuthStore();
  const toast = useToastStore();
  const router = useRouter();
  const error = ref("");
  const loading = ref(false);

  const { mutate: loginMut } = useMutation(LOGIN);
  const { mutate: logoutMut } = useMutation(LOGOUT);
  const { mutate: changePasswordMut } = useMutation(CHANGE_PASSWORD);

  async function login({ username, password }) {
    error.value = "";
    loading.value = true;
    try {
      const res = await loginMut({
        input: { username, password, platform: "EMPLOYEE" },
      });

      // Username/password salah → server balas { data: null, errors: [...] }.
      // Tergantung errorPolicy, error bisa muncul di sini tanpa throw.
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }

      const payload = res?.data?.login?.data;

      if (!payload?.token || !payload?.user) {
        throw new Error("Username atau password salah");
      }

      // Super admin boleh masuk meski bukan staff & tanpa data employee
      // (backend mengembalikan employee null untuk superuser).
      if (!payload.user.isStaff && !payload.user.isSuperuser) {
        throw new Error("Akun Anda tidak memiliki akses ke sistem MAHIR");
      }
      if (!payload.user.isActive) {
        throw new Error("Akun Anda tidak aktif. Hubungi Administrator");
      }

      auth.setSession(payload);
      toast.success(`Selamat datang, ${auth.displayName}!`);

      // Semua peran mendarat di Dashboard (atau rute redirect). Sidebar & guard
      // membatasi menu sesuai permission masing-masing.
      await router.push(router.currentRoute.value.query.redirect || "/dashboard");
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal masuk. Coba lagi.";
      toast.error(error.value);
    } finally {
      loading.value = false;
    }
  }

  // Ubah password akun sendiri. Bila berhasil, langsung logout agar user masuk
  // lagi memakai password baru. Mengembalikan true jika sukses.
  async function changePassword({ oldPassword, newPassword }) {
    error.value = "";
    loading.value = true;
    try {
      const res = await changePasswordMut({ input: { oldPassword, newPassword } });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.changePassword?.data) throw new Error("Gagal mengubah password");
      toast.success("Password berhasil diubah. Silakan masuk kembali dengan password baru.");
      await logout();
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah password. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Set password PERTAMA KALI lewat token aktivasi dari link email.
  // Alur backend: register (nonaktif, tanpa password) → klik link email
  // (akun diaktifkan + token "employee" 7 hari dibawa di URL /verify-email?token=)
  // → halaman ini memakai token itu untuk memanggil changePassword tanpa
  // password lama. Backend (change_password_public) mendeteksi first-time via
  // has_usable_password() sehingga cek "password lama" dilewati.
  //
  // Token dibawa sebagai header Authorization eksplisit (seperti logout()).
  // Sesi lokal dikosongkan lebih dulu agar authLink tidak menimpa header ini
  // dengan token sesi lama yang mungkin masih tersimpan.
  async function setPasswordWithToken({ token, newPassword }) {
    error.value = "";
    loading.value = true;
    try {
      auth.logout();
      const res = await changePasswordMut(
        { input: { oldPassword: "", newPassword } },
        { context: { headers: { Authorization: `Bearer ${token}` } } },
      );
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.changePassword?.data) throw new Error("Gagal mengatur password");
      toast.success("Password berhasil diatur. Silakan masuk dengan password baru Anda.");
      // Bersihkan cache agar tak ada data akun lain yang tersisa.
      apolloClient.clearStore().catch(() => {});
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengatur password. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    // Tangkap token saat ini untuk logout server, lalu bersihkan sesi lokal
    // segera (supaya guard langsung menganggap kita sudah keluar).
    const bearer = auth.token;
    auth.logout();
    toast.info("Anda telah keluar dari sistem");
    router.push("/login");

    if (bearer) {
      try {
        // Bawa Bearer token eksplisit karena token di store sudah dikosongkan.
        await logoutMut(undefined, {
          context: { headers: { Authorization: `Bearer ${bearer}` } },
        });
      } catch {
        // Abaikan kegagalan server — sesi lokal sudah dibersihkan.
      }
    }
    // Kosongkan cache agar data akun sebelumnya tak bocor ke akun berikutnya.
    apolloClient.clearStore().catch(() => {});
  }

  return { login, logout, changePassword, setPasswordWithToken, error, loading };
}
