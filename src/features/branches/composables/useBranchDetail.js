import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_BRANCH } from "../graphql/branch.queries";

// Layer logika detail cabang: ambil satu cabang + karyawan & perusahaan.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useBranchDetail(id) {
  const getBranchId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_BRANCH,
    () => ({ getBranchId: getBranchId.value }),
    () => ({ enabled: getBranchId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const branch = computed(() => result.value?.getBranch?.data ?? null);

  return { branch, loading, error };
}
