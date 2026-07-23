import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LEAVE_TYPE } from "../graphql/leaveType.queries";

// Layer logika detail tipe cuti: ambil satu tipe berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useLeaveTypeDetail(id) {
  const getLeaveTypeId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error, refetch } = useQuery(
    GET_LEAVE_TYPE,
    () => ({ getLeaveTypeId: getLeaveTypeId.value }),
    () => ({ enabled: getLeaveTypeId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const leaveType = computed(() => result.value?.getLeaveType?.data ?? null);

  return { leaveType, loading, error, refetch };
}
