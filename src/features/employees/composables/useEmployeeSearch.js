import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_EMPLOYEE } from "../graphql/employee.queries";

// Pencarian karyawan untuk pilihan select (mis. atasan/parentId).
// Hasil dipetakan ke { id, name } agar cocok dengan SearchableSelect.
export function useEmployeeSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_EMPLOYEE,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() =>
    (result.value?.listEmployee?.data?.results ?? []).map((e) => ({ id: e.id, name: e.fullName })),
  );

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
