import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LEVEL } from "../graphql/level.queries";

// Layer logika detail level: ambil satu level + daftar karyawan berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useLevelDetail(id) {
  const getLevelId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_LEVEL,
    () => ({ getLevelId: getLevelId.value }),
    () => ({ enabled: getLevelId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const level = computed(() => result.value?.getLevel?.data ?? null);

  return { level, loading, error };
}
