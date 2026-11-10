import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_PAYSLIP } from "../graphql/payslip.queries";
import { usePayslipFiltersStore } from "../stores/payslipFilters.store";

// Layer logika daftar slip gaji: paginated & reaktif terhadap filter + halaman.
export function usePayslips() {
  const filters = usePayslipFiltersStore();
  const { employeeIds, periodEndFrom, periodEndTo, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_PAYSLIP,
    () => ({
      params: {
        employeeIds: employeeIds.value?.length ? employeeIds.value : null,
        periodEndFrom: periodEndFrom.value || null,
        periodEndTo: periodEndTo.value || null,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listPayslip?.data ?? null);
  const payslips = computed(() => data.value?.results ?? []);
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

  watch([employeeIds, periodEndFrom, periodEndTo, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }
  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  // Parameter filter aktif — dipakai submit/export "berdasarkan filter".
  function currentFilters() {
    return {
      employeeIds: employeeIds.value?.length ? employeeIds.value : null,
      periodEndFrom: periodEndFrom.value || null,
      periodEndTo: periodEndTo.value || null,
    };
  }

  return { payslips, pagination, loading, refetch, nextPage, prevPage, currentFilters };
}
