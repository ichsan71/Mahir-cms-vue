import { computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  DASHBOARD_STATS,
  ATTENDANCE_WEEKLY,
  DEPT_DISTRIBUTION,
  RECENT_ACTIVITIES,
  PENDING_LEAVES,
  APPROVE_LEAVE,
  REJECT_LEAVE,
} from "../graphql/dashboard.queries";

// Layer logika dashboard: membungkus semua query Apollo + aksi approve/reject.
export function useDashboard() {
  const { result: statsRes, loading: statsLoading } = useQuery(DASHBOARD_STATS);
  const { result: attRes } = useQuery(ATTENDANCE_WEEKLY);
  const { result: deptRes } = useQuery(DEPT_DISTRIBUTION);
  const { result: actRes } = useQuery(RECENT_ACTIVITIES);
  const {
    result: leaveRes,
    refetch: refetchLeaves,
  } = useQuery(PENDING_LEAVES);

  const stats = computed(() => statsRes.value?.dashboardStats ?? null);
  const attendanceWeekly = computed(() => attRes.value?.attendanceWeekly ?? []);
  const deptDistribution = computed(() => deptRes.value?.departmentDistribution ?? []);
  const activities = computed(() => actRes.value?.recentActivities ?? []);
  const pendingLeaves = computed(() => leaveRes.value?.pendingLeaves ?? []);

  const { mutate: approve } = useMutation(APPROVE_LEAVE);
  const { mutate: reject } = useMutation(REJECT_LEAVE);

  async function approveLeave(id) {
    await approve({ id });
    await refetchLeaves();
  }
  async function rejectLeave(id) {
    await reject({ id });
    await refetchLeaves();
  }

  return {
    stats,
    statsLoading,
    attendanceWeekly,
    deptDistribution,
    activities,
    pendingLeaves,
    approveLeave,
    rejectLeave,
  };
}
