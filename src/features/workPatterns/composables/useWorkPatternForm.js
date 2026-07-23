import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_WORK_PATTERN,
  EDIT_WORK_PATTERN,
  DELETE_WORK_PATTERN,
  LIST_WORK_PATTERN,
} from "../graphql/workPattern.queries";
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

// Layer logika tambah/ubah/hapus pola kerja + refresh daftar.
export function useWorkPatternForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_WORK_PATTERN }];

  const { mutate: createMut } = useMutation(CREATE_WORK_PATTERN, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_WORK_PATTERN, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_WORK_PATTERN, { refetchQueries, awaitRefetchQueries: true });

  async function createWorkPattern(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createWorkPattern?.data;
      if (!created) throw new Error("Gagal menambah pola kerja");
      toast.success(`Pola kerja "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah pola kerja. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editWorkPattern(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editWorkPatternId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editWorkPattern?.data;
      if (!updated) throw new Error("Gagal mengubah pola kerja");
      toast.success(`Pola kerja "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah pola kerja. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteWorkPattern(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteWorkPatternId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Pola kerja berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus pola kerja. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createWorkPattern, editWorkPattern, deleteWorkPattern, error, loading };
}
