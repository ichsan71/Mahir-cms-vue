import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_LEVEL_FORM } from "../graphql/level.queries";

// Ambil data level (nama + induk) untuk prefill form edit.
// `id` boleh berupa ref/computed agar reaktif terhadap level yang dipilih.
export function useLevelFormData(id) {
  const getLevelId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading } = useQuery(
    GET_LEVEL_FORM,
    () => ({ getLevelId: getLevelId.value }),
    () => ({ enabled: getLevelId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const level = computed(() => result.value?.getLevel?.data ?? null);

  return { level, loading };
}
