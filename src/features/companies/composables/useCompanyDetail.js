import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_COMPANY } from "../graphql/company.queries";

// Layer logika detail perusahaan: ambil satu perusahaan berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useCompanyDetail(id) {
  const getCompanyId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error } = useQuery(
    GET_COMPANY,
    () => ({ getCompanyId: getCompanyId.value }),
    // Jangan jalankan query bila id belum valid.
    () => ({ enabled: getCompanyId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const company = computed(() => result.value?.getCompany?.data ?? null);

  return { company, loading, error };
}
