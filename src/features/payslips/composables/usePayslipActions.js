import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  GENERATE_PAYSLIP,
  FINALIZE_PAYSLIP,
  ADJUST_PAYSLIP,
  SUBMIT_PAYSLIP,
  RESTORE_PAYSLIP,
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

// Layer aksi siklus hidup slip gaji: generate / finalize / adjust / submit /
// restore. Pemanggil me-refresh daftar lewat callback (tidak di-refetch di sini
// agar fleksibel dengan filter aktif).
export function usePayslipActions() {
  const toast = useToastStore();
  const error = ref("");
  const loading = ref(false);

  const { mutate: generateMut } = useMutation(GENERATE_PAYSLIP);
  const { mutate: finalizeMut } = useMutation(FINALIZE_PAYSLIP);
  const { mutate: adjustMut } = useMutation(ADJUST_PAYSLIP);
  const { mutate: submitMut } = useMutation(SUBMIT_PAYSLIP);
  const { mutate: restoreMut } = useMutation(RESTORE_PAYSLIP);

  async function run(fn, { ok, fail }) {
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

  async function generate({ employeeId, periodMonth, email }) {
    const res = await run(
      () =>
        generateMut({
          employeeId: Number(employeeId),
          periodMonth,
          email: email?.trim() || null,
        }),
      { fail: "Gagal membuat slip gaji. Coba lagi." },
    );
    const data = res?.data?.generatePayslip?.data;
    if (data) toast.success("Slip gaji berhasil dibuat");
    return data || null;
  }

  async function finalize(id) {
    const res = await run(() => finalizeMut({ id: Number(id) }), {
      fail: "Gagal memfinalisasi slip. Coba lagi.",
    });
    const data = res?.data?.finalizePayslip?.data;
    if (data) toast.success("Slip gaji difinalisasi");
    return data || null;
  }

  async function adjust({ id, adjustment, adjustmentNote }) {
    const res = await run(
      () =>
        adjustMut({
          id: Number(id),
          adjustment: String(adjustment),
          adjustmentNote: adjustmentNote?.trim() || null,
        }),
      { fail: "Gagal menyesuaikan slip. Coba lagi." },
    );
    const data = res?.data?.adjustPayslip?.data;
    if (data) toast.success("Penyesuaian slip tersimpan");
    return data || null;
  }

  // Ajukan untuk persetujuan — berdasarkan daftar id ATAU filter aktif.
  async function submit({ ids = null, filters = null }) {
    const res = await run(
      () =>
        submitMut({
          ids: ids?.length ? ids.map(Number) : null,
          filters: filters || null,
        }),
      { fail: "Gagal mengajukan slip. Coba lagi." },
    );
    const data = res?.data?.submitPayslip?.data;
    if (data) toast.success(`${data.length} slip gaji diajukan untuk persetujuan`);
    return data || null;
  }

  async function restore(id) {
    const res = await run(() => restoreMut({ id: Number(id) }), {
      fail: "Gagal memulihkan slip. Coba lagi.",
    });
    const data = res?.data?.restorePayslip?.data;
    if (data) toast.success("Slip gaji dipulihkan");
    return data || null;
  }

  return { generate, finalize, adjust, submit, restore, error, loading };
}
