import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_EMPLOYEE_SALARY_DEDUCTION } from "../graphql/deduction.queries";
import { useDeductionFiltersStore } from "../stores/deductionFilters.store";

// Layer logika potongan gaji: daftar paginated (reaktif terhadap filter & halaman).
export function useSalaryDeductions() {
  const filters = useDeductionFiltersStore();
  const { search, periodEndFrom, periodEndTo, isFinal, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_EMPLOYEE_SALARY_DEDUCTION,
    () => ({
      params: {
        search: search.value?.trim() || null,
        periodEndFrom: periodEndFrom.value || null,
        periodEndTo: periodEndTo.value || null,
        isFinal: isFinal.value === "" ? null : isFinal.value === "true",
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listEmployeeSalaryDeduction?.data ?? null);
  const deductions = computed(() => data.value?.results ?? []);
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

  watch([search, periodEndFrom, periodEndTo, isFinal, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }
  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  return { deductions, pagination, loading, refetch, nextPage, prevPage };
}
