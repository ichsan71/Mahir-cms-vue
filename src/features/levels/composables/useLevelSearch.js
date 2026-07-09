import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEVEL } from "../graphql/level.queries";

// Pencarian level untuk pilihan induk (parentId) — reaktif terhadap kata kunci
// via param `search` pada listLevel.
export function useLevelSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_LEVEL,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listLevel?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
