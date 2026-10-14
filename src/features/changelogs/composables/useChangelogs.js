import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_CHANGELOG } from "../graphql/changelog.queries";
import { useChangelogFiltersStore } from "../stores/changelogFilters.store";

// Layer logika changelog: daftar paginated (reaktif terhadap filter & halaman).
export function useChangelogs() {
  const filters = useChangelogFiltersStore();
  const { search, platform, changeType, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_CHANGELOG,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        // appName dikunci ke "Mahir" (tanpa dropdown filter).
        appName: "Mahir",
        platform: platform.value || null,
        changeType: changeType.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listChangeLog?.data ?? null);
  const changelogs = computed(() => data.value?.results ?? []);
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

  // Ubah filter → kembali ke halaman pertama.
  watch([search, platform, changeType, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }
  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  return { changelogs, pagination, loading, refetch, nextPage, prevPage };
}
