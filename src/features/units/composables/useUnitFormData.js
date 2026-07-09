import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_UNIT_FORM } from "../graphql/unit.queries";

// Ambil data unit minimal untuk prefill form edit (dipanggil saat klik edit).
// `id` boleh berupa ref/computed agar reaktif terhadap unit yang dipilih.
export function useUnitFormData(id) {
  const getUnitId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading } = useQuery(
    GET_UNIT_FORM,
    () => ({ getUnitId: getUnitId.value }),
    // Jangan jalankan query bila id belum valid (mode tambah).
    () => ({ enabled: getUnitId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const unit = computed(() => result.value?.getUnit?.data ?? null);

  return { unit, loading };
}
