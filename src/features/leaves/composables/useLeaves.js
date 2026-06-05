import { computed, reactive } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LEAVES,
  LEAVE_STATS,
  APPROVE_LEAVE,
  REJECT_LEAVE,
  CREATE_LEAVE,
} from "../graphql/leave.queries";

export function useLeaves() {
  const filters = reactive({ search: "", status: "" });

  const { result, loading, refetch } = useQuery(
    LEAVES,
    () => ({ search: filters.search || null, status: filters.status || null }),
    { fetchPolicy: "cache-and-network" },
  );
  const { result: statsRes, refetch: refetchStats } = useQuery(LEAVE_STATS);

  const leaves = computed(() => result.value?.leaves ?? []);
  const stats = computed(() => statsRes.value?.leaveStats ?? null);

  const { mutate: approveMut } = useMutation(APPROVE_LEAVE);
  const { mutate: rejectMut } = useMutation(REJECT_LEAVE);
  const { mutate: createMut } = useMutation(CREATE_LEAVE);

  async function refreshAll() {
    await Promise.all([refetch(), refetchStats()]);
  }

  async function approve(id) {
    await approveMut({ id });
    await refreshAll();
  }
  async function reject(id) {
    await rejectMut({ id });
    await refreshAll();
  }
  async function createLeave(input) {
    await createMut({ input });
    await refreshAll();
  }

  return { filters, leaves, stats, loading, approve, reject, createLeave };
}
