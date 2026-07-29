import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  CREATE_ANNOUNCEMENT,
  EDIT_ANNOUNCEMENT,
  DELETE_ANNOUNCEMENT,
} from "../graphql/announcement.queries";
import { useToastStore } from "@/stores/toast.store";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Layer logika buat pengumuman (createAnnouncement). File pada `attachments`
// terkirim langsung sebagai berkas berkat createUploadLink (apollo-upload-client).
export function useAnnouncementForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_ANNOUNCEMENT);
  const { mutate: editMut } = useMutation(EDIT_ANNOUNCEMENT);
  const { mutate: deleteMut } = useMutation(DELETE_ANNOUNCEMENT);

  async function createAnnouncement(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createAnnouncement?.data;
      if (!created) throw new Error("Gagal membuat pengumuman");
      toast.success("Pengumuman berhasil dibuat");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal membuat pengumuman. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function editAnnouncement(id, input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await editMut({ editAnnouncementId: Number(id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.editAnnouncement?.data;
      if (!updated) throw new Error("Gagal mengubah pengumuman");
      toast.success("Pengumuman berhasil diperbarui");
      return updated;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengubah pengumuman. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Soft delete: `hard` selalu false sesuai kebijakan.
  async function deleteAnnouncement(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await deleteMut({ deleteAnnouncementId: Number(id), hard: false });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      toast.success("Pengumuman berhasil dihapus");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menghapus pengumuman. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { createAnnouncement, editAnnouncement, deleteAnnouncement, error, loading };
}
