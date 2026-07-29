import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { GET_RANGE_ATTENDANCE_HISTORY } from "../graphql/attendance.queries";
import { useAttendanceHistoryFiltersStore } from "../stores/attendanceHistoryFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Layer logika riwayat kehadiran (snapshot) — reaktif terhadap filter & halaman.
// `employeeIds` diturunkan dari akun login: id employee sendiri digabung dengan
// id seluruh bawahan langsung (childrens). Bila keduanya kosong (mis. superadmin
// tanpa employee) → null (backend menentukan cakupan default).
export function useAttendanceHistory() {
  const filters = useAttendanceHistoryFiltersStore();
  const { search, snapshotDateGte, snapshotDateLte, status, page, pageSize } =
    storeToRefs(filters);
  const auth = useAuthStore();

  // [employee.id, ...childrens[].id] — unik, angka (Int), tanpa nilai kosong.
  const employeeIds = computed(() => {
    const ids = [auth.employee?.id, ...auth.childrenIds]
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    return [...new Set(ids)];
  });

  const { result, loading, refetch } = useQuery(
    GET_RANGE_ATTENDANCE_HISTORY,
    () => ({
      params: {
        page: page.value || null,
        pageSize: pageSize.value || null,
        search: search.value?.trim() || null,
        status: status.value || null,
        snapshotDateGte: snapshotDateGte.value || null,
        snapshotDateLte: snapshotDateLte.value || null,
        employeeIds: employeeIds.value.length ? employeeIds.value : null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const histories = computed(
    () => result.value?.getRangeAttendanceHistory?.histories ?? [],
  );

  // Backend tak mengembalikan metadata paginasi pada query ini, jadi paginasi
  // bersifat optimistis: ada halaman berikutnya bila halaman ini terisi penuh.
  const pagination = computed(() => {
    const size = pageSize.value || 10;
    return {
      currentPage: page.value,
      hasPrev: page.value > 1,
      hasNext: histories.value.length >= size,
    };
  });

  // Opsi status untuk filter, diturunkan dari status yang muncul pada data.
  const statusOptions = computed(() => {
    const set = new Set();
    for (const h of histories.value) {
      if (h.status) set.add(String(h.status));
    }
    return [...set].sort();
  });

  watch([search, snapshotDateGte, snapshotDateLte, status, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }

  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  return { histories, pagination, statusOptions, loading, refetch, nextPage, prevPage };
}
