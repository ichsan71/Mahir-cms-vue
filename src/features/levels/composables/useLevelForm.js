import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_LEVEL, EDIT_LEVEL, DELETE_LEVEL, LIST_LEVEL } from "../graphql/level.queries";
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

// Layer logika tambah/ubah/hapus level + refresh daftar.
export function useLevelForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_LEVEL }];

  const { mutate: createMut } = useMutation(CREATE_LEVEL, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_LEVEL, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_LEVEL, { refetchQueries, awaitRefetchQueries: true });

  async function createLevel(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLevel?.data;
      if (!created) throw new Error("Gagal menambah level");
      toast.success(`Level "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah level. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editLevel(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editLevelId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editLevel?.data;
      if (!updated) throw new Error("Gagal mengubah level");
      toast.success(`Level "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah level. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteLevel(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteLevelId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Level berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus level. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createLevel, editLevel, deleteLevel, error, loading };
}
