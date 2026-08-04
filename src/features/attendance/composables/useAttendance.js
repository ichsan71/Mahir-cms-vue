import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_ATTENDANCE } from "../graphql/attendance.queries";
import { useAttendanceFiltersStore } from "../stores/attendanceFilters.store";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { summarizeAttendance } from "../summary";

// Layer logika kehadiran: daftar paginated (reaktif terhadap filter & halaman).
// `scope` menentukan ruang lingkup data:
// - "self" (default) → `employeeId` = akun login (kehadiran diri sendiri;
//   superadmin employee=null → semua data).
// - "team"           → `employeeIds` = seluruh bawahan langsung (childrens); atau
//   bila satu anggota dipilih (`teamMemberId`), fokus ke `employeeId` orang itu.
export function useAttendance(scope = "self") {
  const filters = useAttendanceFiltersStore();
  const { search, dateGte, dateLte, teamMemberId, page, pageSize } = storeToRefs(filters);
  const auth = useAuthStore();

  const { result, loading, refetch } = useQuery(
    LIST_ATTENDANCE,
    () => {
      const isTeam = scope === "team";
      // Tab Tim: satu anggota dipilih → employeeId; "Semua" → employeeIds bawahan.
      const teamMember = isTeam && teamMemberId.value ? teamMemberId.value : null;
      return {
        params: {
          page: page.value || null,
          pageSize: pageSize.value || null,
          search: search.value?.trim() || null,
          dateGte: dateGte.value || null,
          dateLte: dateLte.value || null,
          employeeId: isTeam ? teamMember : (auth.employee?.id ?? null),
          employeeIds: isTeam && !teamMember ? auth.childrenIds : null,
        },
      };
    },
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listAttendance?.data ?? null);
  const records = computed(() => data.value?.results ?? []);
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

  // Ringkasan status dari baris yang termuat (halaman aktif) — bukan agregat global.
  const summary = computed(() => summarizeAttendance(records.value));

  watch([search, dateGte, dateLte, teamMemberId, pageSize], () => {
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

  return { records, summary, pagination, pageSize, loading, refetch, nextPage, prevPage, goToPage };
}
