// ──────────────────────────────────────────────────────────────
// Apollo Client.
// - Jika VITE_GRAPHQL_URI di-set  → HttpLink ke backend GraphQL nyata.
// - Jika kosong                   → SchemaLink ke skema mock in-memory.
// Komponen/composable tidak perlu tahu mana yang dipakai.
//
// Saat memakai backend nyata:
// - authLink menyisipkan header `Authorization: Bearer <token>` dari store.
// - errorLink mendeteksi token kedaluwarsa/sesi invalid → logout + redirect.
// ──────────────────────────────────────────────────────────────
import { ApolloClient, InMemoryCache, from, setLogVerbosity } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { SchemaLink } from "@apollo/client/link/schema";
import { createUploadLink } from "apollo-upload-client";
import { schema } from "./mock/schema";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { router } from "@/router";

// Bungkam warning-level log Apollo. `@vue/apollo-composable` masih memanggil
// method ObservableQuery yang sudah deprecated (getLastResult/resetLastResults)
// saat query re-subscribe (mis. ketika filter berubah); pada build produksi
// warning itu muncul sebagai "An error occurred!" yang menyesatkan. Error asli
// tetap ditampilkan.
setLogVerbosity("error");

const uri = import.meta.env.VITE_GRAPHQL_URI;

// Sisipkan Bearer token (jika ada) pada setiap request ke backend.
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore().token;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Deteksi error autentikasi: token kedaluwarsa / sesi tidak valid.
function isAuthError(graphQLErrors, networkError) {
  const expiredPattern = /expired|unauthenticated|unauthorized|signature|invalid token|not authenticated|token/i;
  const hasGqlAuthError = (graphQLErrors || []).some((err) => {
    const code = err?.extensions?.code;
    return (
      code === "UNAUTHENTICATED" ||
      code === "FORBIDDEN" ||
      code === "TOKEN_EXPIRED" ||
      expiredPattern.test(err?.message || "")
    );
  });
  const status = networkError?.statusCode || networkError?.response?.status;
  return hasGqlAuthError || status === 401 || status === 403;
}

let handlingExpiry = false;

function handleSessionExpired() {
  if (handlingExpiry) return;
  handlingExpiry = true;

  const auth = useAuthStore();
  // Hindari toast/redirect saat memang belum login (mis. di halaman login).
  if (auth.isAuthenticated) {
    auth.logout();
    useToastStore().error("Sesi Anda telah berakhir. Silakan masuk kembali.");
    const current = router.currentRoute.value;
    if (current.name !== "login") {
      router.push({
        name: "login",
        query: current.path !== "/" ? { redirect: current.fullPath } : {},
      });
    }
  }

  // Reset flag agar deteksi berikutnya tetap berfungsi.
  setTimeout(() => {
    handlingExpiry = false;
  }, 1000);
}

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (isAuthError(graphQLErrors, networkError)) {
    handleSessionExpired();
  }
});

// VITE_GRAPHQL_URI terisi → pakai backend nyata lewat proxy same-origin /graphql
// (lihat proxy di vite.config.js) agar terhindar dari CORS. Kosong → mock.
// createUploadLink (apollo-upload-client) menggantikan HttpLink: mendukung
// GraphQL multipart upload sehingga File (mis. logo) terkirim langsung sebagai
// berkas, dan tetap menangani request biasa seperti HttpLink.
const transportLink = uri ? createUploadLink({ uri: "/graphql" }) : new SchemaLink({ schema });

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, transportLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
