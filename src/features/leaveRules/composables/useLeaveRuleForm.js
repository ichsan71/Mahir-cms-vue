import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_LEAVE_RULE,
  EDIT_LEAVE_RULE,
  DELETE_LEAVE_RULE,
  LIST_LEAVE_RULE,
} from "../graphql/leaveRule.queries";
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

// Layer logika tambah/ubah/hapus aturan cuti + refresh daftar.
export function useLeaveRuleForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_LEAVE_RULE }];

  const { mutate: createMut } = useMutation(CREATE_LEAVE_RULE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_LEAVE_RULE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_LEAVE_RULE, { refetchQueries, awaitRefetchQueries: true });

  async function createLeaveRule(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLeaveRule?.data;
      if (!created) throw new Error("Gagal menambah aturan cuti");
      toast.success("Aturan cuti berhasil ditambahkan");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah aturan cuti. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editLeaveRule(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editLeaveRuleId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editLeaveRule?.data;
      if (!updated) throw new Error("Gagal mengubah aturan cuti");
      toast.success("Aturan cuti berhasil diperbarui");
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah aturan cuti. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteLeaveRule(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteLeaveRuleId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Aturan cuti berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus aturan cuti. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createLeaveRule, editLeaveRule, deleteLeaveRule, error, loading };
}
