import { computed, unref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { GET_EMPLOYEE } from "../graphql/employee.queries";

// Layer logika detail karyawan: ambil satu karyawan berdasarkan id.
// `id` boleh berupa ref/computed agar reaktif terhadap perubahan rute.
export function useEmployeeDetail(id) {
  const getEmployeeId = computed(() => {
    const raw = unref(id);
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const { result, loading, error, refetch } = useQuery(
    GET_EMPLOYEE,
    () => ({ getEmployeeId: getEmployeeId.value }),
    // Jangan jalankan query bila id belum valid.
    () => ({ enabled: getEmployeeId.value !== null, fetchPolicy: "cache-and-network" }),
  );

  const employee = computed(() => result.value?.getEmployee?.data ?? null);

  return { employee, loading, error, refetch };
}
