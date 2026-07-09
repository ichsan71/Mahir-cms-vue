import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_COMPANY, EDIT_COMPANY, DELETE_COMPANY, LIST_COMPANY } from "../graphql/company.queries";
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

// Layer logika tambah perusahaan: jalankan mutasi createCompany + refresh daftar.
export function useCompanyForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_COMPANY, {
    // Segarkan daftar perusahaan setelah tambah berhasil.
    refetchQueries: [{ query: LIST_COMPANY }],
    awaitRefetchQueries: true,
  });

  const { mutate: editMut } = useMutation(EDIT_COMPANY, {
    // Segarkan daftar perusahaan setelah ubah berhasil.
    refetchQueries: [{ query: LIST_COMPANY }],
    awaitRefetchQueries: true,
  });

  const { mutate: deleteMut } = useMutation(DELETE_COMPANY, {
    // Segarkan daftar perusahaan setelah hapus berhasil.
    refetchQueries: [{ query: LIST_COMPANY }],
    awaitRefetchQueries: true,
  });

  async function createCompany(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      const created = res?.data?.createCompany?.data;
      if (!created) {
        throw new Error("Gagal menambah perusahaan");
      }
      toast.success(`Perusahaan "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah perusahaan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editCompany(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editCompanyId: Number(id), input });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      const updated = res?.data?.editCompany?.data;
      if (!updated) {
        throw new Error("Gagal mengubah perusahaan");
      }
      toast.success(`Perusahaan "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah perusahaan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteCompany(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteCompanyId: Number(id), hard: false });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      toast.success("Perusahaan berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus perusahaan. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createCompany, editCompany, deleteCompany, error, loading };
}
