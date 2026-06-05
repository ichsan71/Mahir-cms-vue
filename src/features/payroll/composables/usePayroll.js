import { computed, reactive } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  PAYROLLS,
  PAYROLL_STATS,
  PROCESS_PAYROLL,
  PROCESS_ALL_PAYROLL,
} from "../graphql/payroll.queries";

export function usePayroll() {
  const filters = reactive({ search: "", status: "" });

  const { result, loading, refetch } = useQuery(
    PAYROLLS,
    () => ({ search: filters.search || null, status: filters.status || null }),
    { fetchPolicy: "cache-and-network" },
  );
  const { result: statsRes, refetch: refetchStats } = useQuery(PAYROLL_STATS);

  const payrolls = computed(() => result.value?.payrolls ?? []);
  const stats = computed(() => statsRes.value?.payrollStats ?? null);

  const { mutate: processMut } = useMutation(PROCESS_PAYROLL);
  const { mutate: processAllMut } = useMutation(PROCESS_ALL_PAYROLL);

  async function refreshAll() {
    await Promise.all([refetch(), refetchStats()]);
  }

  async function process(id) {
    await processMut({ id });
    await refreshAll();
  }

  async function processAll() {
    await processAllMut();
    await refreshAll();
  }

  return { filters, payrolls, stats, loading, process, processAll };
}
