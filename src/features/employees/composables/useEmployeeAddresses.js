import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_EMPLOYEE_ADDRESS,
  EDIT_EMPLOYEE_ADDRESS,
  DELETE_EMPLOYEE_ADDRESS,
} from "../graphql/employeeAddress.queries";
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

// Layer logika CRUD alamat karyawan (create/edit/delete). Penyegaran daftar
// dilakukan pemanggil (mis. refetch getEmployee) karena alamat ditampilkan
// per-karyawan lewat employee.addresses.
export function useEmployeeAddresses() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_EMPLOYEE_ADDRESS);
  const { mutate: editMut } = useMutation(EDIT_EMPLOYEE_ADDRESS);
  const { mutate: deleteMut } = useMutation(DELETE_EMPLOYEE_ADDRESS);

  async function createAddress(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeAddress?.data) throw new Error("Gagal menambah alamat");
      toast.success("Alamat berhasil ditambahkan");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah alamat. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function editAddress(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editEmployeeAddressId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeAddress?.data) throw new Error("Gagal mengubah alamat");
      toast.success("Alamat berhasil diperbarui");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah alamat. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteAddress(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteEmployeeAddressId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Alamat berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus alamat. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createAddress, editAddress, deleteAddress, error, loading };
}
