import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_EMPLOYMENT_TYPE,
  EDIT_EMPLOYMENT_TYPE,
  DELETE_EMPLOYMENT_TYPE,
  LIST_EMPLOYMENT_TYPE,
} from "../graphql/employmentType.queries";
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

// Layer logika tambah/ubah tipe kepegawaian + refresh daftar.
export function useEmploymentTypeForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_EMPLOYMENT_TYPE }];

  const { mutate: createMut } = useMutation(CREATE_EMPLOYMENT_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_EMPLOYMENT_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_EMPLOYMENT_TYPE, { refetchQueries, awaitRefetchQueries: true });

  async function createEmploymentType(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createEmploymentType?.data;
      if (!created) throw new Error("Gagal menambah tipe kepegawaian");
      toast.success(`Tipe kepegawaian "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah tipe kepegawaian. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editEmploymentType(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editEmploymentTypeId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editEmploymentType?.data;
      if (!updated) throw new Error("Gagal mengubah tipe kepegawaian");
      toast.success(`Tipe kepegawaian "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah tipe kepegawaian. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteEmploymentType(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteEmploymentTypeId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Tipe kepegawaian berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus tipe kepegawaian. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createEmploymentType, editEmploymentType, deleteEmploymentType, error, loading };
}
