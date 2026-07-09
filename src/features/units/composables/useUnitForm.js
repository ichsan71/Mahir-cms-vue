import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_UNIT, EDIT_UNIT, DELETE_UNIT, LIST_UNIT } from "../graphql/unit.queries";
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

// Layer logika tambah unit: jalankan mutasi createUnit + refresh daftar.
export function useUnitForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_UNIT, {
    // Segarkan daftar unit setelah tambah berhasil.
    refetchQueries: [{ query: LIST_UNIT }],
    awaitRefetchQueries: true,
  });

  const { mutate: editMut } = useMutation(EDIT_UNIT, {
    // Segarkan daftar unit setelah ubah berhasil.
    refetchQueries: [{ query: LIST_UNIT }],
    awaitRefetchQueries: true,
  });

  const { mutate: deleteMut } = useMutation(DELETE_UNIT, {
    // Segarkan daftar unit setelah hapus berhasil.
    refetchQueries: [{ query: LIST_UNIT }],
    awaitRefetchQueries: true,
  });

  async function createUnit(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      const created = res?.data?.createUnit?.data;
      if (!created) {
        throw new Error("Gagal menambah unit");
      }
      toast.success(`Unit "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah unit. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editUnit(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editUnitId: Number(id), input });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      const updated = res?.data?.editUnit?.data;
      if (!updated) {
        throw new Error("Gagal mengubah unit");
      }
      toast.success(`Unit "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah unit. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteUnit(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteUnitId: Number(id), hard: false });
      if (res?.errors?.length) {
        throw new Error(res.errors[0].message);
      }
      toast.success("Unit berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus unit. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createUnit, editUnit, deleteUnit, error, loading };
}
