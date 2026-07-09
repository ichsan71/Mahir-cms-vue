import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { ENUM_VALUES } from "@/shared/graphql/enum.queries";

// Ubah nama enum (UPPER_SNAKE_CASE) → label terbaca, mis. SUB_DIVISION → "Sub Division".
export function prettyEnum(name) {
  return String(name || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Ambil pilihan dari enum backend lewat introspeksi (reusable).
// `typeName` boleh berupa string atau ref. Mengembalikan options [{ value, label }].
export function useEnumChoices(typeName) {
  const { result, loading } = useQuery(
    ENUM_VALUES,
    () => ({ name: unref(typeName) }),
    // Enum jarang berubah → cukup cache-first.
    { fetchPolicy: "cache-first" },
  );

  const options = computed(() =>
    (result.value?.__type?.enumValues ?? []).map((e) => ({
      value: e.name,
      label: prettyEnum(e.name),
    })),
  );

  return { options, loading };
}
