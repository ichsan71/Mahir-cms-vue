import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  REGISTER_EMPLOYEE,
  EDIT_EMPLOYEE,
  DELETE_EMPLOYEE,
  LIST_EMPLOYEE,
  RESEND_VERIFICATION_EMAIL,
} from "../graphql/employee.queries";
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

// Layer logika pendaftaran karyawan baru (registerEmployee) + refresh daftar.
export function useEmployeeRegister() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_EMPLOYEE }];

  const { mutate: registerMut } = useMutation(REGISTER_EMPLOYEE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_EMPLOYEE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_EMPLOYEE, { refetchQueries, awaitRefetchQueries: true });
  // Resend tak mengubah data list (status tetap non-aktif) → tanpa refetch.
  const { mutate: resendMut } = useMutation(RESEND_VERIFICATION_EMAIL);

  // Loading terpisah agar tombol resend per-baris tidak ikut men-disable form.
  const resending = ref(false);

  async function registerEmployee({ username, email, input }) {
    error.value = "";
    loading.value = true;
    try {
      const res = await registerMut({ username, email, input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.registerEmployee?.data;
      if (!created) throw new Error("Gagal mendaftarkan karyawan");
      toast.success(`Karyawan "${created.fullName}" berhasil didaftarkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mendaftarkan karyawan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editEmployee(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editEmployeeId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editEmployee?.data;
      if (!updated) throw new Error("Gagal mengubah karyawan");
      toast.success(`Karyawan "${updated.fullName}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah karyawan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteEmployee(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteEmployeeId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Karyawan berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus karyawan. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Kirim ulang email verifikasi/aktivasi untuk user yang belum aktif.
  // `userId` = id akun user (emp.user.id). Pesan diambil dari `detail` backend.
  async function resendVerification(userId) {
    error.value = "";
    resending.value = true;
    try {
      const res = await resendMut({ userId: Number(userId) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const data = res?.data?.resendVerificationEmail?.data;
      if (!data?.success) throw new Error(data?.detail || "Gagal mengirim ulang email verifikasi");
      toast.success(data.detail || "Email verifikasi berhasil dikirim ulang");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengirim ulang email verifikasi. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      resending.value = false;
    }
  }

  return { registerEmployee, editEmployee, deleteEmployee, resendVerification, error, loading, resending };
}
