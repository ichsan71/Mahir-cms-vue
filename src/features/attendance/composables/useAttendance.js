import { computed, reactive } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { ATTENDANCE_RECORDS, ATTENDANCE_STATS } from "../graphql/attendance.queries";

export function useAttendance() {
  const filters = reactive({ search: "", status: "" });

  const { result, loading } = useQuery(
    ATTENDANCE_RECORDS,
    () => ({ search: filters.search || null, status: filters.status || null }),
    { fetchPolicy: "cache-and-network" },
  );
  const { result: statsRes } = useQuery(ATTENDANCE_STATS);

  const records = computed(() => result.value?.attendanceRecords ?? []);
  const stats = computed(() => statsRes.value?.attendanceStats ?? null);

  return { filters, records, stats, loading };
}
