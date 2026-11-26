import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { IMPORT_MANUAL_ATTENDANCE } from "../graphql/attendance.queries";
import { useToastStore } from "@/stores/toast.store";

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika impor kehadiran manual dari berkas (importManualAttendance).
// `file` (CSV/XLSX) terkirim langsung sebagai berkas berkat createUploadLink.
// Backend memproses async & mengirim hasil ke `notifyEmail`; respons hanya
// metadata antrean (detail, requestId, rowCount). Lihat juga
// useBulkManualAttendance (input baris, bukan berkas).
export function useImportManualAttendance() {
  const toast = useToastStore();
  const submitting = ref(false);

  const { mutate } = useMutation(IMPORT_MANUAL_ATTENDANCE);

  async function importFile({ file, notifyEmail }) {
    if (submitting.value) return null;
    if (!file) {
      toast.error("Pilih berkas yang akan diimpor dulu.");
      return null;
    }
    submitting.value = true;
    try {
      const res = await mutate({ file, notifyEmail: notifyEmail?.trim() || "" });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.importManualAttendance?.data;
      if (!data) throw new Error("Gagal memproses impor kehadiran.");

      toast.success(
        data.detail ||
          `Impor ${data.rowCount ?? ""} baris sedang diproses; hasil dikirim ke ${notifyEmail}.`,
      );
      return data;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal memproses impor kehadiran.");
      return null;
    } finally {
      submitting.value = false;
    }
  }

  return { importFile, submitting };
}
