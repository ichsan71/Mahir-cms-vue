import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { EXPORT_ATTENDANCE } from "../graphql/attendance.queries";
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

// Layer logika ekspor kehadiran (exportAttendance). Backend memproses ekspor
// secara async lalu mengirim hasilnya ke email tujuan; respons hanya metadata.
export function useAttendanceExport() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: exportMut } = useMutation(EXPORT_ATTENDANCE);

  // payload: { dateFrom, dateTo, email }.
  async function exportAttendance({ dateFrom = null, dateTo = null, email }) {
    error.value = "";
    loading.value = true;
    try {
      const input = {
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        email: email?.trim() || null,
      };
      const res = await exportMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.exportAttendance?.data;
      if (!data) throw new Error("Gagal memproses ekspor kehadiran");
      toast.success(
        data.detail ||
          `Ekspor ${data.attendanceCount ?? ""} data kehadiran sedang diproses dan akan dikirim ke ${input.email}`,
      );
      return data;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal memproses ekspor kehadiran. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { exportAttendance, error, loading };
}
