import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_RULE } from "../graphql/leaveRule.queries";
import { useLeaveRuleFiltersStore } from "../stores/leaveRuleFilters.store";

// Layer logika aturan cuti: daftar paginated (reaktif terhadap filter & halaman).
export function useLeaveRules() {
  const filters = useLeaveRuleFiltersStore();
  const { search, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_LEAVE_RULE,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listLeaveRule?.data ?? null);
  const leaveRules = computed(() => data.value?.results ?? []);
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

  watch([search, pageSize], () => {
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

  return { leaveRules, pagination, pageSize, loading, refetch, nextPage, prevPage, goToPage };
}
