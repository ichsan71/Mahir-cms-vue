import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_SHIFT } from "../graphql/shift.queries";
import { useShiftFiltersStore } from "../stores/shiftFilters.store";

// Layer logika shift: daftar paginated (reaktif terhadap filter & halaman).
export function useShifts() {
  const filters = useShiftFiltersStore();
  const { search, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_SHIFT,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        name: null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listShift?.data ?? null);
  const shifts = computed(() => data.value?.results ?? []);
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

  return { shifts, pagination, pageSize, loading, refetch, nextPage, prevPage, goToPage };
}
