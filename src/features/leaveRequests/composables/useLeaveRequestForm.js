import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_LEAVE, SUBMIT_LEAVE, CANCEL_LEAVE } from "../graphql/leaveRequest.queries";
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

// Layer logika ajukan cuti (createLeave).
export function useLeaveRequestForm() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: createMut } = useMutation(CREATE_LEAVE);
  const { mutate: submitMut } = useMutation(SUBMIT_LEAVE);
  const { mutate: cancelMut } = useMutation(CANCEL_LEAVE);

  async function createLeave(input) {
    error.value = "";
    loading.value = true;
    try {
      const res = await createMut({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const created = res?.data?.createLeave?.data;
      if (!created) throw new Error("Gagal mengajukan cuti");
      toast.success("Pengajuan cuti berhasil dibuat");
      return created;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengajukan cuti. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Kirim pengajuan (DRAFT → alur persetujuan).
  async function submitLeave(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await submitMut({ submitLeaveId: Number(id) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const submitted = res?.data?.submitLeave?.data;
      if (!submitted) throw new Error("Gagal mengirim pengajuan");
      toast.success("Pengajuan cuti berhasil dikirim");
      return submitted;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal mengirim pengajuan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // Batalkan pengajuan (hanya saat DRAFT).
  async function cancelLeave(id) {
    error.value = "";
    loading.value = true;
    try {
      const res = await cancelMut({ cancelLeaveId: Number(id) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const cancelled = res?.data?.cancelLeave?.data;
      if (!cancelled) throw new Error("Gagal membatalkan pengajuan");
      toast.success("Pengajuan cuti berhasil dibatalkan");
      return cancelled;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal membatalkan pengajuan. Coba lagi.";
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { createLeave, submitLeave, cancelLeave, error, loading };
}
