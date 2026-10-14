import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_CHANGELOG } from "../graphql/changelog.queries";

// Layer logika detail changelog: ambil satu changelog berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif (mis. saat modal detail dibuka).
export function useChangelogDetail(id) {
  const changelogId = computed(() => {
    const n = Number(unref(id));
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_CHANGELOG,
    () => ({ id: changelogId.value }),
    () => ({ enabled: changelogId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const changelog = computed(() => result.value?.getChangeLog?.data ?? null);

  return { changelog, loading, error };
}
