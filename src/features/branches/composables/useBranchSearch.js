import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_BRANCH } from "../graphql/branch.queries";

// Pencarian cabang untuk pilihan select (param `search` pada listBranch).
export function useBranchSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_BRANCH,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listBranch?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
