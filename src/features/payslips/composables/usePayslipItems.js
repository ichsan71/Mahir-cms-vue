import { computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_PAYSLIP_ITEM,
  CREATE_PAYSLIP_ITEM,
  EDIT_PAYSLIP_ITEM,
  DELETE_PAYSLIP_ITEM,
} from "../graphql/payslip.queries";
import { useToastStore } from "@/stores/toast.store";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Kode item manual di-generate otomatis (user tidak mengisinya).
function autoCode() {
  return `ADJ-${Date.now().toString(36).toUpperCase()}`;
}

// Kelola line-item satu slip: daftar + simpan (edit semua item) + tambah/hapus
// item manual. `payslipId` & `enabled` berupa ref agar query reaktif ke modal.
export function usePayslipItems(payslipId, enabled) {
  const toast = useToastStore();

  const { result, loading, refetch } = useQuery(
    LIST_PAYSLIP_ITEM,
    () => ({ params: { payslip: payslipId.value ? Number(payslipId.value) : null, pageSize: 200 } }),
    () => ({
      enabled: !!(enabled?.value && payslipId.value),
      fetchPolicy: "cache-and-network",
    }),
  );

  const items = computed(() => result.value?.listPayslipItem?.data?.results ?? []);
  // Item manual = kind ADJUSTMENT (bisa diubah); sisanya (EARNING/DEDUCTION/
  // BPJS_EMPLOYEE/BPJS_EMPLOYER/TAX) dihitung otomatis & read-only.
  const manualItems = computed(() => items.value.filter((i) => i.kind === "ADJUSTMENT"));
  const autoItems = computed(() => items.value.filter((i) => i.kind !== "ADJUSTMENT"));

  const { mutate: createMut, loading: creating } = useMutation(CREATE_PAYSLIP_ITEM);
  const { mutate: editMut, loading: editing } = useMutation(EDIT_PAYSLIP_ITEM);
  const { mutate: deleteMut, loading: deleting } = useMutation(DELETE_PAYSLIP_ITEM);

  const saving = computed(() => creating.value || editing.value || deleting.value);

  async function run(fn, { okMsg, failMsg }) {
    try {
      const res = await fn();
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      await refetch();
      if (okMsg) toast.success(okMsg);
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || failMsg);
      return false;
    }
  }

  const dec = (v) => (v == null || v === "" ? null : String(v));

  // Tambah item manual (kind ADJUSTMENT). Decimal dikirim sebagai String.
  function create({ note, amount }) {
    return run(
      () =>
        createMut({
          input: {
            payslipId: Number(payslipId.value),
            kind: "ADJUSTMENT",
            code: autoCode(),
            note: note?.trim() || null,
            amount: String(amount),
          },
        }),
      { okMsg: "Item penyesuaian ditambahkan", failMsg: "Gagal menambah item." },
    );
  }

  // Simpan perubahan satu item (otomatis maupun manual). Field asli di-echo balik
  // (kind/componentTypeId/kategori/prorata dsb.) agar tidak hilang; hanya `note`
  // & `amount` yang diubah user.
  function save(item) {
    return run(
      () =>
        editMut({
          id: Number(item.id),
          input: {
            payslipId: Number(payslipId.value),
            kind: item.kind || "ADJUSTMENT",
            code: item.code || autoCode(),
            componentTypeId: item.componentTypeId ?? null,
            category: item.category ?? null,
            order: item.order ?? null,
            base: dec(item.base),
            dailyRate: dec(item.dailyRate),
            paidDays: item.paidDays ?? null,
            prorated: item.prorated ?? null,
            note: item.note?.trim() || null,
            amount: String(item.amount),
          },
        }),
      { okMsg: "Item disimpan", failMsg: "Gagal menyimpan item." },
    );
  }

  function remove(id) {
    return run(() => deleteMut({ id: Number(id) }), {
      okMsg: "Item penyesuaian dihapus",
      failMsg: "Gagal menghapus item.",
    });
  }

  return { items, manualItems, autoItems, loading, saving, refetch, create, save, remove };
}
