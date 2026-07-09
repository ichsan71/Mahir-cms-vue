import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_SHIFT, EDIT_SHIFT, DELETE_SHIFT, LIST_SHIFT } from "../graphql/shift.queries";
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

// Layer logika tambah/ubah/hapus shift + refresh daftar.
export function useShiftForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const refetchQueries = [{ query: LIST_SHIFT }];

  const { mutate: createMut } = useMutation(CREATE_SHIFT, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: editMut } = useMutation(EDIT_SHIFT, { refetchQueries, awaitRefetchQueries: true });
  const { mutate: deleteMut } = useMutation(DELETE_SHIFT, { refetchQueries, awaitRefetchQueries: true });

  async function createShift(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createShift?.data;
      if (!created) throw new Error("Gagal menambah shift");
      toast.success(`Shift "${created.name}" berhasil ditambahkan`);
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah shift. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editShift(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editShiftId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editShift?.data;
      if (!updated) throw new Error("Gagal mengubah shift");
      toast.success(`Shift "${updated.name}" berhasil diperbarui`);
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah shift. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteShift(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteShiftId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Shift berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus shift. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createShift, editShift, deleteShift, error, loading };
}
