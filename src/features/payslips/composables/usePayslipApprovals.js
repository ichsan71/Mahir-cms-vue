import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_PAYSLIP_APPROVAL } from "../graphql/payslip.queries";
import { usePayslipApprovalFiltersStore } from "../stores/payslipApprovalFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika inbox persetujuan slip gaji (baris PayslipApproval), paginated.
export function usePayslipApprovals() {
  const filters = usePayslipApprovalFiltersStore();
  const { status, employeeIds, page, pageSize } = storeToRefs(filters);
  const auth = useAuthStore();

  // Inbox = hanya approval yang approver-nya adalah employee user login.
  // Superuser tidak punya employee → approverIds null (lihat semua).
  const approverIds = computed(() =>
    auth.employee?.id ? [Number(auth.employee.id)] : null,
  );

  const { result, loading, refetch } = useQuery(
    LIST_PAYSLIP_APPROVAL,
    () => ({
      params: {
        status: status.value || null,
        employeeIds: employeeIds.value?.length ? employeeIds.value : null,
        approverIds: approverIds.value,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listPayslipApproval?.data ?? null);
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

  watch([status, employeeIds, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }
  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  return { approvals, pagination, loading, refetch, nextPage, prevPage };
}
