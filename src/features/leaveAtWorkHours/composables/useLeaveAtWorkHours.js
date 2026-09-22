import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_AT_WORK_HOUR } from "../graphql/leaveAtWorkHour.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika daftar izin di jam kerja (paginated, reaktif terhadap filter).
// Bila `scope` = "self" → hanya izin milik akun login (employeeId). Superadmin
// (employee=null) otomatis melihat semua karena employeeId jadi null.
export function useLeaveAtWorkHours(scope = "self") {
  const auth = useAuthStore();

  const search = ref("");
  const status = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  const employeeId = computed(() => (scope === "self" ? auth.employee?.id ?? null : null));

  const { result, loading, refetch } = useQuery(
    LIST_LEAVE_AT_WORK_HOUR,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        status: status.value || null,
        employeeId: employeeId.value,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listLeaveAtWorkHour?.data ?? null);
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

  return { items, pagination, loading, refetch, search, status, page, pageSize, nextPage, prevPage };
}
