import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_WORK_PATTERN } from "../graphql/workPattern.queries";

// Pencarian pola kerja untuk pilihan `workPatternId` — reaktif terhadap kata
// kunci via param `search` pada listWorkPattern.
export function useWorkPatternSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_WORK_PATTERN,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listWorkPattern?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
