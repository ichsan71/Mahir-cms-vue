import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { APPROVE_LEAVE, REJECT_LEAVE } from "../graphql/leaveApproval.queries";
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

// Layer logika aksi persetujuan cuti (approve/reject) oleh approver.
// `id` = id baris LeaveApproval (bukan id Leave).
export function useLeaveApprovalActions() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: approveMut } = useMutation(APPROVE_LEAVE);
  const { mutate: rejectMut } = useMutation(REJECT_LEAVE);

  async function approveLeave(approvalId) {
    error.value = "";
    loading.value = true;
    try {
      const res = await approveMut({ approveLeaveId: Number(approvalId) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.approveLeave?.data) throw new Error("Gagal menyetujui cuti");
      toast.success("Cuti berhasil disetujui");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menyetujui cuti. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function rejectLeave(approvalId) {
    error.value = "";
    loading.value = true;
    try {
      const res = await rejectMut({ rejectLeaveId: Number(approvalId) });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.rejectLeave?.data) throw new Error("Gagal menolak cuti");
      toast.success("Cuti berhasil ditolak");
      return true;
    } catch (e) {
      error.value = cleanMessage(e) || "Gagal menolak cuti. Coba lagi.";
      toast.error(error.value);
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { approveLeave, rejectLeave, error, loading };
}
