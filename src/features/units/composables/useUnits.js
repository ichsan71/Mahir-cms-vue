import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_UNIT } from "../graphql/unit.queries";
import { useUnitFiltersStore } from "../stores/unitFilters.store";

// Layer logika unit: daftar paginated (reaktif terhadap filter & halaman).
export function useUnits() {
  const filters = useUnitFiltersStore();
  const { search, page, pageSize } = storeToRefs(filters);

  // Variabel query dibungkus fungsi agar reaktif terhadap perubahan filter/halaman.
  const { result, loading, refetch } = useQuery(
    LIST_UNIT,
    () => ({
      params: {
        search: search.value?.trim() || null,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listUnit?.data ?? null);
  const units = computed(() => data.value?.results ?? []);
  const pagination = computed(() => {
    const count = data.value?.count ?? 0;
    const size = pageSize.value || 10;
    return {
      count,
      currentPage: data.value?.currentPage ?? page.value,
      totalPages: Math.max(1, Math.ceil(count / size)),
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
    units,
    pagination,
    pageSize,
    loading,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  };
}
