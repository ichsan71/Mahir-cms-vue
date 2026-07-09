import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_UNIT } from "../graphql/unit.queries";

// Layer logika detail unit: ambil satu unit berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useUnitDetail(id) {
  const getUnitId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_UNIT,
    () => ({ getUnitId: getUnitId.value }),
    // Jangan jalankan query bila id belum valid.
    () => ({ enabled: getUnitId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const unit = computed(() => result.value?.getUnit?.data ?? null);

  return { unit, loading, error };
}
