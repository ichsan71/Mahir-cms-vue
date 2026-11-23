import { computed, ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  LIST_LEAVE_AT_WORK_HOUR,
  LIST_LEAVE_AT_WORK_HOUR_APPROVALS_FOR_LEAVES,
} from "../graphql/leaveAtWorkHour.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika daftar izin di jam kerja (paginated, reaktif terhadap filter).
// Bila `scope` = "self" → hanya izin milik akun login (employeeId). Superadmin
// (employee=null) otomatis melihat semua karena employeeId jadi null.
export function useLeaveAtWorkHours(scope = "self") {
  const auth = useAuthStore();

  const search = ref("");
  // Default tampilan Pengajuan (self) = hanya izin yang "menunggu persetujuan"
  // (selaras dengan list Pengajuan cuti). Nilai "PENDING" sesuai STATUS_FILTERS
  // pada view & LeaveAtWorkHourStatusChoices backend.
  const status = ref(scope === "self" ? "PENDING" : "");
  const page = ref(1);
  const pageSize = ref(10);

  const employeeId = computed(() => (scope === "self" ? auth.employee?.id ?? null : null));

  const { result, loading, refetch: refetchList } = useQuery(
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
  const rawItems = computed(() => data.value?.results ?? []);

  // Progres persetujuan: field nested `approvals` pada listLeaveAtWorkHour tidak
  // ter-populate backend, jadi approval untuk izin yang tampil diambil terpisah
  // (per halaman) lalu digabung ke tiap baris sebagai `approvals` — agar kartu
  // Pengajuan bisa menampilkan "Menunggu: <approver>" seperti list cuti.
  const leaveIds = computed(() => rawItems.value.map((r) => Number(r.id)).filter(Boolean));

  const { result: apprResult, refetch: refetchApprovals } = useQuery(
    LIST_LEAVE_AT_WORK_HOUR_APPROVALS_FOR_LEAVES,
    () => ({
      params: {
        leaveAtWorkHourIds: leaveIds.value,
        page: 1,
        pageSize: 200,
      },
    }),
    () => ({ enabled: leaveIds.value.length > 0, fetchPolicy: "cache-and-network" }),
  );

  // Kelompokkan approval berdasarkan id izin induknya.
  const approvalsByLeave = computed(() => {
    const rows = apprResult.value?.listLeaveAtWorkHourApproval?.data?.results ?? [];
    const map = new Map();
    for (const a of rows) {
      const lid = a?.leaveAtWorkHour?.id;
      if (lid == null) continue;
      const key = Number(lid);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    // Urutkan tiap grup sesuai `order` (eskalasi) bila tersedia.
    for (const list of map.values()) {
      list.sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
    }
    return map;
  });

  const items = computed(() =>
    rawItems.value.map((r) => ({
      ...r,
      approvals: approvalsByLeave.value.get(Number(r.id)) ?? r.approvals ?? [],
    })),
  );
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

  // Refetch keduanya: daftar izin + progres persetujuannya.
  function refetch() {
    refetchList();
    if (leaveIds.value.length) refetchApprovals();
  }

  return { items, pagination, loading, refetch, search, status, page, pageSize, nextPage, prevPage };
}
