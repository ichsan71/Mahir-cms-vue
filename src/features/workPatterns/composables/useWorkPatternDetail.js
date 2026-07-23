import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_WORK_PATTERN } from "../graphql/workPattern.queries";

// Layer logika detail pola kerja: ambil satu pola berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useWorkPatternDetail(id) {
  const getWorkPatternId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error, refetch } = useQuery(
    GET_WORK_PATTERN,
    () => ({ getWorkPatternId: getWorkPatternId.value }),
    () => ({ enabled: getWorkPatternId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const workPattern = computed(() => result.value?.getWorkPattern?.data ?? null);

  return { workPattern, loading, error, refetch };
}
