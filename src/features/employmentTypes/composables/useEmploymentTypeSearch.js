import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_EMPLOYMENT_TYPE } from "../graphql/employmentType.queries";

// Pencarian tipe kepegawaian untuk pilihan select (param `search`).
export function useEmploymentTypeSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_EMPLOYMENT_TYPE,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listEmploymentType?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
