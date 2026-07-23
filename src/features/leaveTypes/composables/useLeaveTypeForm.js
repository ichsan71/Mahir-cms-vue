import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_LEAVE_TYPE,
  EDIT_LEAVE_TYPE,
  DELETE_LEAVE_TYPE,
  LIST_LEAVE_TYPE,
} from "../graphql/leaveType.queries";
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

// Layer logika tambah/ubah/hapus tipe cuti + refresh daftar.
export function useLeaveTypeForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_LEAVE_TYPE }];

  const { mutate: createMut } = useMutation(CREATE_LEAVE_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_LEAVE_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_LEAVE_TYPE, { refetchQueries, awaitRefetchQueries: true });

  async function createLeaveType(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLeaveType?.data;
      if (!created) throw new Error("Gagal menambah tipe cuti");
      toast.success(`Tipe cuti "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah tipe cuti. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editLeaveType(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editLeaveTypeId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editLeaveType?.data;
      if (!updated) throw new Error("Gagal mengubah tipe cuti");
      toast.success(`Tipe cuti "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah tipe cuti. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteLeaveType(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteLeaveTypeId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Tipe cuti berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus tipe cuti. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createLeaveType, editLeaveType, deleteLeaveType, error, loading };
}
