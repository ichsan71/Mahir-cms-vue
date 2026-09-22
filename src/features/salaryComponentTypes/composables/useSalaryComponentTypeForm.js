import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_SALARY_COMPONENT_TYPE,
  EDIT_SALARY_COMPONENT_TYPE,
  DELETE_SALARY_COMPONENT_TYPE,
  LIST_SALARY_COMPONENT_TYPE,
} from "../graphql/salaryComponentType.queries";
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

// Layer logika tambah/ubah/hapus komponen penggajian + refresh daftar.
export function useSalaryComponentTypeForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_SALARY_COMPONENT_TYPE }];

  const { mutate: createMut } = useMutation(CREATE_SALARY_COMPONENT_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_SALARY_COMPONENT_TYPE, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_SALARY_COMPONENT_TYPE, { refetchQueries, awaitRefetchQueries: true });

  async function createComponentType(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createSalaryComponentType?.data;
      if (!created) throw new Error("Gagal menambah komponen penggajian");
      toast.success(`Komponen "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah komponen penggajian. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editComponentType(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editSalaryComponentTypeId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editSalaryComponentType?.data;
      if (!updated) throw new Error("Gagal mengubah komponen penggajian");
      toast.success(`Komponen "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah komponen penggajian. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteComponentType(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteSalaryComponentTypeId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Komponen penggajian berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus komponen penggajian. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createComponentType, editComponentType, deleteComponentType, error, loading };
}
