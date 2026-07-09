import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_EMPLOYMENT_TYPE } from "../graphql/employmentType.queries";

// Layer logika detail tipe kepegawaian: ambil satu tipe + daftar karyawan.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useEmploymentTypeDetail(id) {
  const getEmploymentTypeId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_EMPLOYMENT_TYPE,
    () => ({ getEmploymentTypeId: getEmploymentTypeId.value }),
    () => ({ enabled: getEmploymentTypeId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const employmentType = computed(() => result.value?.getEmploymentType?.data ?? null);

  return { employmentType, loading, error };
}
