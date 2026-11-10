import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { EXPORT_PAYSLIP } from "../graphql/payslip.queries";
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

// Layer logika ekspor slip gaji (exportPayslip). Backend memproses secara async
// lalu mengirim berkas ke email tujuan; respons hanya metadata antrean.
export function usePayslipExport() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: exportMut } = useMutation(EXPORT_PAYSLIP);

  // payload: { email, filters (PayslipParams), format ("CSV" | "XLSX") }.
  async function exportPayslip({ email, filters = null, format = null }) {
    error.value = "";
    loading.value = true;
    try {
      const input = {
        email: email?.trim(),
        filters: filters || null,
        format: format || null,
      };
      const res = await exportMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.exportPayslip?.data;
      if (!data) throw new Error("Gagal memproses ekspor slip gaji");
      toast.success(
        `Ekspor ${data.payslipCount ?? ""} slip gaji sedang diproses dan akan dikirim ke ${input.email}`,
      );
      return data;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal memproses ekspor slip gaji. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { exportPayslip, error, loading };
}
