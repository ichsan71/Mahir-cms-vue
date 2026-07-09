import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_UNIT } from "../graphql/unit.queries";

// Pencarian unit untuk pilihan induk (parentId) — reaktif terhadap kata kunci
// via param `search` pada listUnit.
export function useUnitSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_UNIT,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listUnit?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
