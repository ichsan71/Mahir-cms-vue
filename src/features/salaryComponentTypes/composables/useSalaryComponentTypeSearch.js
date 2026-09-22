import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_SALARY_COMPONENT_TYPE } from "../graphql/salaryComponentType.queries";

// Pencarian komponen penggajian untuk pilihan select (param `search`).
// Hanya komponen aktif yang bisa dipakai pada struktur gaji. Label opsi
// digabung "Nama (KODE)" agar mudah dibedakan.
export function useSalaryComponentTypeSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_SALARY_COMPONENT_TYPE,
    () => ({ params: { search: search.value || null, isActive: true, page: 1, pageSize: 20 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() =>
    (result.value?.listSalaryComponentType?.data?.results ?? []).map((c) => ({
      id: c.id,
      name: c.code ? `${c.name} (${c.code})` : c.name,
      category: c.category,
    })),
  );

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
