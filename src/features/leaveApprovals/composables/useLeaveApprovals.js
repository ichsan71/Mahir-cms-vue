import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_APPROVAL } from "../graphql/leaveApproval.queries";
import { useLeaveApprovalFiltersStore } from "../stores/leaveApprovalFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika persetujuan cuti: daftar paginated (reaktif terhadap filter & halaman).
export function useLeaveApprovals() {
  const filters = useLeaveApprovalFiltersStore();
  const { search, status, page, pageSize } = storeToRefs(filters);
  const auth = useAuthStore();

  const { result, loading, refetch } = useQuery(
    LIST_LEAVE_APPROVAL,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        status: status.value || null,
        // approverId = id employee akun login (mahir_employee di localStorage).
        approverId: auth.employee?.id ?? null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listLeaveApproval?.data ?? null);
  const approvals = computed(() => data.value?.results ?? []);
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

  return { approvals, pagination, pageSize, loading, refetch, nextPage, prevPage, goToPage };
}
