import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEVEL } from "../graphql/level.queries";
import { useLevelFiltersStore } from "../stores/levelFilters.store";

// Layer logika level: daftar paginated (reaktif terhadap filter & halaman).
export function useLevels() {
  const filters = useLevelFiltersStore();
  const { search, page, pageSize } = storeToRefs(filters);

  // Variabel query dibungkus fungsi agar reaktif terhadap perubahan filter/halaman.
  const { result, loading, refetch } = useQuery(
    LIST_LEVEL,
    () => ({
      params: {
        search: search.value?.trim() || null,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listLevel?.data ?? null);
  const levels = computed(() => data.value?.results ?? []);
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

  // Ubah filter → kembali ke halaman pertama agar hasil tetap relevan.
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

  return {
    levels,
    pagination,
    pageSize,
    loading,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  };
}
