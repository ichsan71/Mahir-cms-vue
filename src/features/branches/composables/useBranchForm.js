import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_BRANCH, EDIT_BRANCH, DELETE_BRANCH, LIST_BRANCH } from "../graphql/branch.queries";
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

// Layer logika tambah/ubah/hapus cabang + refresh daftar.
export function useBranchForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_BRANCH }];

  const { mutate: createMut } = useMutation(CREATE_BRANCH, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_BRANCH, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_BRANCH, { refetchQueries, awaitRefetchQueries: true });

  async function createBranch(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createBranch?.data;
      if (!created) throw new Error("Gagal menambah cabang");
      toast.success(`Cabang "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah cabang. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editBranch(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editBranchId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editBranch?.data;
      if (!updated) throw new Error("Gagal mengubah cabang");
      toast.success(`Cabang "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah cabang. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteBranch(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteBranchId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Cabang berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus cabang. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createBranch, editBranch, deleteBranch, error, loading };
}
