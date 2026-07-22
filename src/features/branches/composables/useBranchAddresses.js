import { ref, computed, unref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_BRANCH_ADDRESS,
  CREATE_BRANCH_ADDRESS,
  EDIT_BRANCH_ADDRESS,
  DELETE_BRANCH_ADDRESS,
} from "../graphql/branch.queries";
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

// Daftar alamat sebuah cabang (difilter lewat `branchName`).
// `branchName` boleh ref/computed agar reaktif terhadap detail cabang yang dibuka.
export function useBranchAddresses(branchName) {
  const name = computed(() => unref(branchName) || null);

  const { result, loading, refetch } = useQuery(
    LIST_BRANCH_ADDRESS,
    () => ({ params: { branchName: name.value, page: null, pageSize: null, search: null } }),
    () => ({ enabled: !!name.value, fetchPolicy: "cache-and-network" }),
  );

  const data = computed(() => result.value?.listBranchAddress?.data ?? null);
  const addresses = computed(() => data.value?.results ?? []);
  const pagination = computed(() => ({
    count: data.value?.count ?? 0,
    currentPage: data.value?.currentPage ?? 1,
    totalPages: data.value?.totalPages ?? 1,
    hasNext: data.value?.hasNext ?? false,
    hasPrev: data.value?.hasPrev ?? false,
  }));

  return { addresses, pagination, loading, refetch };
}

// Layer logika tambah alamat cabang.
export function useBranchAddressForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_BRANCH_ADDRESS);
  const { mutate: editMut } = useMutation(EDIT_BRANCH_ADDRESS);
  const { mutate: deleteMut } = useMutation(DELETE_BRANCH_ADDRESS);

  async function createAddress(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createBranchAddress?.data;
      if (!created) throw new Error("Gagal menambah alamat");
      toast.success("Alamat cabang berhasil ditambahkan");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menambah alamat. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editAddress(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editBranchAddressId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editBranchAddress?.data;
      if (!updated) throw new Error("Gagal mengubah alamat");
      toast.success("Alamat cabang berhasil diperbarui");
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah alamat. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteAddress(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteBranchAddressId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Alamat cabang berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus alamat. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createAddress, editAddress, deleteAddress, error, loading };
}
