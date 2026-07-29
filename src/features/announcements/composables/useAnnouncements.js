import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_ANNOUNCEMENT } from "../graphql/announcement.queries";
import { useAnnouncementFiltersStore } from "../stores/announcementFilters.store";

// Layer logika pengumuman: daftar paginated (reaktif terhadap filter & halaman).
export function useAnnouncements() {
  const filters = useAnnouncementFiltersStore();
  const { title, status, companyIds, unitIds, page, pageSize } = storeToRefs(filters);

  const { result, loading, refetch } = useQuery(
    LIST_ANNOUNCEMENT,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        title: title.value?.trim() || null,
        status: status.value || null,
        companyIds: companyIds.value.length ? companyIds.value.map(Number) : null,
        unitIds: unitIds.value.length ? unitIds.value.map(Number) : null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listAnnouncement?.data ?? null);
  const announcements = computed(() => data.value?.results ?? []);
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
  watch([title, status, companyIds, unitIds, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }
  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  return { announcements, pagination, loading, refetch, nextPage, prevPage };
}
