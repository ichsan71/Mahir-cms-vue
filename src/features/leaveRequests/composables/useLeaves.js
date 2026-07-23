import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE } from "../graphql/leaveRequest.queries";
import { useLeaveFiltersStore } from "../stores/leaveFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika pengajuan cuti: daftar paginated (reaktif terhadap filter & halaman).
// `employeeId` dibawa dari akun login (self-service): karyawan biasa hanya melihat
// pengajuannya sendiri; superadmin (employee=null) → semua.
export function useLeaves() {
  const filters = useLeaveFiltersStore();
  const { search, status, page, pageSize } = storeToRefs(filters);
  const auth = useAuthStore();

  const { result, loading, refetch } = useQuery(
    LIST_LEAVE,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        status: status.value || null,
        employeeId: auth.employee?.id ?? null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listLeave?.data ?? null);
  const leaves = computed(() => data.value?.results ?? []);
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

  watch([search, status, pageSize], () => {
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

  return { leaves, pagination, pageSize, loading, refetch, nextPage, prevPage, goToPage };
}
