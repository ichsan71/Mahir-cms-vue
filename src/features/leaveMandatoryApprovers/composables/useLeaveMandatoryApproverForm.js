import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_LEAVE_MANDATORY_APPROVER,
  EDIT_LEAVE_MANDATORY_APPROVER,
  DELETE_LEAVE_MANDATORY_APPROVER,
  LIST_LEAVE_MANDATORY_APPROVER,
} from "../graphql/leaveMandatoryApprover.queries";
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

// Layer logika tambah/ubah/hapus approver wajib + refresh daftar.
export function useLeaveMandatoryApproverForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_LEAVE_MANDATORY_APPROVER }];

  const { mutate: createMut } = useMutation(CREATE_LEAVE_MANDATORY_APPROVER, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_LEAVE_MANDATORY_APPROVER, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_LEAVE_MANDATORY_APPROVER, { refetchQueries, awaitRefetchQueries: true });

  async function createApprover(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLeaveMandatoryApprover?.data;
      if (!created) throw new Error("Gagal menambah approver wajib");
      toast.success("Approver wajib berhasil ditambahkan");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah approver wajib. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editApprover(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editLeaveMandatoryApproverId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editLeaveMandatoryApprover?.data;
      if (!updated) throw new Error("Gagal mengubah approver wajib");
      toast.success("Approver wajib berhasil diperbarui");
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah approver wajib. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteApprover(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteLeaveMandatoryApproverId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Approver wajib berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus approver wajib. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createApprover, editApprover, deleteApprover, error, loading };
}
