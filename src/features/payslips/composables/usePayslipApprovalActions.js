import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  APPROVE_PAYSLIP,
  REJECT_PAYSLIP,
  APPROVE_PAYSLIP_MANY,
  REJECT_PAYSLIP_MANY,
} from "../graphql/payslip.queries";
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

// Layer aksi persetujuan slip gaji (approve/reject, satuan & massal).
// `id`/`ids` = id baris PayslipApproval (bukan id Payslip).
export function usePayslipApprovalActions() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: approveMut } = useMutation(APPROVE_PAYSLIP);
  const { mutate: rejectMut } = useMutation(REJECT_PAYSLIP);
  const { mutate: approveManyMut } = useMutation(APPROVE_PAYSLIP_MANY);
  const { mutate: rejectManyMut } = useMutation(REJECT_PAYSLIP_MANY);

  async function run(fn, { okMsg, fail }) {
    error.value = "";
    loading.value = true;
    try {
      const res = await fn();
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      return res;
    } catch (e) {
      error.value = cleanMessage(e) || fail;
      toast.error(error.value);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function approve(approvalId, remark = null) {
    const res = await run(
      () => approveMut({ id: Number(approvalId), remark: remark?.trim() || null }),
      { fail: "Gagal menyetujui slip. Coba lagi." },
    );
    const ok = !!res?.data?.approvePayslip?.data;
    if (ok) toast.success("Slip gaji disetujui");
    return ok;
  }

  async function reject(approvalId, remark = null) {
    const res = await run(
      () => rejectMut({ id: Number(approvalId), remark: remark?.trim() || null }),
      { fail: "Gagal menolak slip. Coba lagi." },
    );
    const ok = !!res?.data?.rejectPayslip?.data;
    if (ok) toast.success("Slip gaji ditolak");
    return ok;
  }

  async function approveMany(ids, remark = null) {
    const res = await run(
      () => approveManyMut({ ids: ids.map(Number), remark: remark?.trim() || null }),
      { fail: "Gagal menyetujui slip terpilih. Coba lagi." },
    );
    const data = res?.data?.approvePayslipMany?.data;
    if (data) toast.success(`${data.length} slip gaji disetujui`);
    return data || null;
  }

  async function rejectMany(ids, remark = null) {
    const res = await run(
      () => rejectManyMut({ ids: ids.map(Number), remark: remark?.trim() || null }),
      { fail: "Gagal menolak slip terpilih. Coba lagi." },
    );
    const data = res?.data?.rejectPayslipMany?.data;
    if (data) toast.success(`${data.length} slip gaji ditolak`);
    return data || null;
  }

  return { approve, reject, approveMany, rejectMany, error, loading };
}
