import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_SALARY_COMPONENT_TYPE } from "../graphql/salaryComponentType.queries";
import { useSalaryComponentTypeFiltersStore } from "../stores/salaryComponentTypeFilters.store";

// Layer logika komponen penggajian: daftar paginated (reaktif terhadap filter & halaman).
export function useSalaryComponentTypes() {
  const filters = useSalaryComponentTypeFiltersStore();
  const { search, category, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_SALARY_COMPONENT_TYPE,
    () => ({
      params: {
        search: search.value?.trim() || null,
        category: category.value || null,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listSalaryComponentType?.data ?? null);
  const componentTypes = computed(() => data.value?.results ?? []);
  const pagination = computed(() => {
    const count = data.value?.count ?? 0;
    const size = pageSize.value || 10;
    return {
      count,
      currentPage: data.value?.currentPage ?? page.value,
      totalPages: data.value?.totalPages ?? Math.max(1, Math.ceil(count / size)),
      hasNext: data.value?.hasNext ?? false,
      hasPrev: data.value?.hasPrev ?? false,
    };
  });

  watch([search, category, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }

  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  function goToPage(p) {
    page.value = p;
  }

  return {
    componentTypes,
    pagination,
    pageSize,
    loading,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  };
}
