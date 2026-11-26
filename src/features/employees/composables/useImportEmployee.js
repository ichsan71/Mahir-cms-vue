import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  BULK_IMPORT_EMPLOYEE,
  EXPORT_EMPLOYEE_IMPORT_TEMPLATE,
} from "../graphql/employee.queries";
import { useToastStore } from "@/stores/toast.store";

function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika impor karyawan massal dari berkas (bulkImportEmployee).
// `file` (CSV/XLSX) terkirim langsung sebagai berkas berkat createUploadLink.
// Backend memproses async & mengirim hasil ke `notifyEmail`; respons hanya
// metadata antrean (detail, requestId). Mirror dari useImportManualAttendance.
export function useImportEmployee() {
  const toast = useToastStore();
  const submitting = ref(false);

  const { mutate } = useMutation(BULK_IMPORT_EMPLOYEE);

  // Minta template impor dikirim ke email (exportEmployeeImportTemplate).
  const requestingTemplate = ref(false);
  const { mutate: mutateTemplate } = useMutation(EXPORT_EMPLOYEE_IMPORT_TEMPLATE);

  async function requestTemplate(email) {
    const to = email?.trim();
    if (requestingTemplate.value) return null;
    if (!to) {
      toast.error("Isi email tujuan dulu untuk menerima template.");
      return null;
    }
    requestingTemplate.value = true;
    try {
      const res = await mutateTemplate({ email: to });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.exportEmployeeImportTemplate?.data;
      if (!data) throw new Error("Gagal meminta template.");

      toast.success(data.detail || `Template impor dikirim ke ${to}.`);
      return data;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal meminta template impor.");
      return null;
    } finally {
      requestingTemplate.value = false;
    }
  }

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
      const data = res?.data?.bulkImportEmployee?.data;
      if (!data) throw new Error("Gagal memproses impor karyawan.");

      toast.success(
        data.detail ||
          `Impor karyawan sedang diproses; hasil dikirim ke ${notifyEmail}.`,
      );
      return data;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal memproses impor karyawan.");
      return null;
    } finally {
      submitting.value = false;
    }
  }

  return { importFile, submitting, requestTemplate, requestingTemplate };
}
