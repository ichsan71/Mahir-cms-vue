import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  COMPUTE_EMPLOYEE_SALARY_DEDUCTION,
  LIST_EMPLOYEE_SALARY_DEDUCTION,
} from "../graphql/deduction.queries";
import { useToastStore } from "@/stores/toast.store";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message ||
    e?.networkError?.message ||
    e?.message ||
    "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika "Hitung Potongan": panggil computeEmployeeSalaryDeduction lalu
// refresh daftar potongan.
export function useComputeDeduction() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: computeMut } = useMutation(COMPUTE_EMPLOYEE_SALARY_DEDUCTION, {
    refetchQueries: [{ query: LIST_EMPLOYEE_SALARY_DEDUCTION }],
    awaitRefetchQueries: true,
  });

  async function compute(employeeId, periodMonth) {
    error.value = "";
    loading.value = true;
    try {
      const res = await computeMut({ employeeId: Number(employeeId), periodMonth });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.computeEmployeeSalaryDeduction?.data;
      if (!created) throw new Error("Gagal menghitung potongan");
      toast.success("Potongan gaji berhasil dihitung");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghitung potongan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { compute, error, loading };
}
