import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { LOGIN } from "../graphql/auth.queries";
import { useAuthStore } from "../stores/auth.store";
import { useToastStore } from "@/stores/toast.store";

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

      // Hanya staf aktif yang boleh masuk ke sistem.
      if (!payload.user.isStaff) {
        throw new Error("Akun Anda tidak memiliki akses ke sistem MAHIR");
      }
      if (!payload.user.isActive) {
        throw new Error("Akun Anda tidak aktif. Hubungi Administrator");
      }

      auth.setSession(payload);
      toast.success(`Selamat datang, ${auth.displayName}!`);

      const redirect = router.currentRoute.value.query.redirect || "/dashboard";
      await router.push(redirect);
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal masuk. Coba lagi.";
      toast.error(error.value);
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    auth.logout();
    toast.info("Anda telah keluar dari sistem");
    router.push("/login");
  }

  return { login, logout, error, loading };
}
