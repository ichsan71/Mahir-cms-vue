import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { LOGIN } from "../graphql/auth.queries";
import { useAuthStore } from "../stores/auth.store";

// Layer logika autentikasi: login (GraphQL) + logout + state error/loading.
export function useAuth() {
  const auth = useAuthStore();
  const router = useRouter();
  const error = ref("");
  const loading = ref(false);

  const { mutate: loginMut } = useMutation(LOGIN);

  async function login({ email, password }) {
    error.value = "";
    loading.value = true;
    try {
      const res = await loginMut({ email, password });
      auth.setSession(res.data.login);
      const redirect = router.currentRoute.value.query.redirect || "/dashboard";
      await router.push(redirect);
    } catch (e) {
      error.value = e?.message?.replace(/^GraphQL error:\s*/, "") || "Gagal masuk. Coba lagi.";
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    auth.logout();
    router.push("/login");
  }

  return { login, logout, error, loading };
}
