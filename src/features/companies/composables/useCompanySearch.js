import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_COMPANY } from "../graphql/company.queries";

// Pencarian perusahaan untuk pilihan induk (parentId) — reaktif terhadap
// kata kunci via param `search` pada listCompany.
export function useCompanySearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_COMPANY,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listCompany?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
