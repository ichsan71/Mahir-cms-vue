import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_SHIFT } from "../graphql/shift.queries";

// Pencarian shift untuk pilihan select (param `search` pada listShift).
export function useShiftSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_SHIFT,
    () => ({
      params: {
        page: 1,
        pageSize: 10,
        search: search.value || null,
        name: null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listShift?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
