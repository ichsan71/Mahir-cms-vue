import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LEAVE_RULE } from "../graphql/leaveRule.queries";

// Layer logika detail aturan cuti: ambil satu aturan berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useLeaveRuleDetail(id) {
  const getLeaveRuleId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error, refetch } = useQuery(
    GET_LEAVE_RULE,
    () => ({ getLeaveRuleId: getLeaveRuleId.value }),
    () => ({ enabled: getLeaveRuleId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const leaveRule = computed(() => result.value?.getLeaveRule?.data ?? null);

  return { leaveRule, loading, error, refetch };
}
