import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_SHIFT } from "../graphql/shift.queries";

// Layer logika detail shift: ambil satu shift berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useShiftDetail(id) {
  const getShiftId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_SHIFT,
    () => ({ getShiftId: getShiftId.value }),
    () => ({ enabled: getShiftId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const shift = computed(() => result.value?.getShift?.data ?? null);

  return { shift, loading, error };
}
