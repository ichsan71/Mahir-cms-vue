// ──────────────────────────────────────────────────────────────
// Apollo Client.
// - Jika VITE_GRAPHQL_URI di-set  → HttpLink ke backend GraphQL nyata.
// - Jika kosong                   → SchemaLink ke skema mock in-memory.
// Komponen/composable tidak perlu tahu mana yang dipakai.
// ──────────────────────────────────────────────────────────────
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import { SchemaLink } from "@apollo/client/link/schema";
import { schema } from "./mock/schema";

const uri = import.meta.env.VITE_GRAPHQL_URI;

const link = uri
  ? new HttpLink({ uri })
  : new SchemaLink({ schema });

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
