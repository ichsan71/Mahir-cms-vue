import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { EXPORT_EMPLOYEE } from "../graphql/employee.queries";
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

// Layer logika ekspor karyawan (exportEmployee). Backend memproses ekspor secara
// async lalu mengirim hasilnya ke email tujuan; respons hanya metadata antrean.
export function useEmployeeExport() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: exportMut } = useMutation(EXPORT_EMPLOYEE);

  // payload: { dateFrom, dateTo, filters, email }.
  async function exportEmployee({ dateFrom = null, dateTo = null, filters = null, email }) {
    error.value = "";
    loading.value = true;
    try {
      const input = {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        filters: filters || null,
        email: email?.trim() || null,
      };
      const res = await exportMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.exportEmployee?.data;
      if (!data) throw new Error("Gagal memproses ekspor karyawan");
      toast.success(
        data.detail ||
          `Ekspor ${data.employeeCount ?? ""} karyawan sedang diproses dan akan dikirim ke ${input.email}`,
      );
      return data;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal memproses ekspor karyawan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { exportEmployee, error, loading };
}
