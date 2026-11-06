import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_AT_WORK_HOUR_APPROVAL } from "../graphql/leaveAtWorkHour.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika tugas persetujuan izin di jam kerja (tab "Persetujuan").
// Daftar difilter `approverId` = id employee akun login: tiap baris adalah satu
// tugas persetujuan (approver ⇢ izin). Approve/Reject memakai id BARIS ini.
export function useLeaveAtWorkHourApprovals() {
  const auth = useAuthStore();

  const search = ref("");
  const status = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  const { result, loading, refetch } = useQuery(
    LIST_LEAVE_AT_WORK_HOUR_APPROVAL,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        status: status.value || null,
        approverId: auth.employee?.id ?? null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  // Query terpisah khusus menghitung tugas berstatus PENDING (untuk badge
  // notifikasi di tab), independen dari filter/halaman daftar utama.
  const { result: pendingResult, refetch: refetchCount } = useQuery(
    LIST_LEAVE_AT_WORK_HOUR_APPROVAL,
    () => ({
      params: {
        status: "PENDING",
        approverId: auth.employee?.id ?? null,
        page: 1,
        pageSize: 1,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );
  const pendingCount = computed(
    () => pendingResult.value?.listLeaveAtWorkHourApproval?.data?.count ?? 0,
  );

  const data = computed(() => result.value?.listLeaveAtWorkHourApproval?.data ?? null);
  const items = computed(() => data.value?.results ?? []);
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

  return { items, pagination, loading, refetch, pendingCount, refetchCount, search, status, page, pageSize, nextPage, prevPage };
}
