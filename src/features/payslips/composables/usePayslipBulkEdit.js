import { ref } from "vue";
import { useApolloClient, useMutation } from "@vue/apollo-composable";
import { LIST_PAYSLIP_ITEM, BULK_EDIT_PAYSLIP_ITEM } from "../graphql/payslip.queries";
import { useToastStore } from "@/stores/toast.store";

// Bersihkan prefix teknis dari pesan error GraphQL/Apollo.
function cleanMessage(e) {
  const raw =
    e?.graphQLErrors?.[0]?.message || e?.networkError?.message || e?.message || "";
  return raw.replace(/^GraphQL error:\s*/i, "").trim();
}

// Decimal untuk dikirim balik: null bila kosong, selain itu String.
const dec = (v) => (v == null || v === "" ? null : String(v));

// Edit massal komponen slip lintas-payslip. Alur:
// 1) muat item tiap payslip terpilih (sekali, saat modal dibuka),
// 2) kelompokkan komponen OTOMATIS (kind ≠ ADJUSTMENT) berdasarkan `code` →
//    jadi katalog "komponen yang sama di beberapa payslip",
// 3) user pilih 1 komponen + nominal baru → kirim bulkEditPayslipItem sekaligus.
// Item manual (ADJUSTMENT) dikecualikan: itu penyesuaian per-karyawan, bukan
// komponen seragam.
export function usePayslipBulkEdit() {
  const toast = useToastStore();
  const { client } = useApolloClient();
  const { mutate: bulkMut } = useMutation(BULK_EDIT_PAYSLIP_ITEM);

  const loading = ref(false);
  const saving = ref(false);
  // Katalog komponen: [{ code, kind, category, rows: [{ payslipId, employeeName,
  // item }] }] — `item` = PayslipItem asli (utuh) untuk di-echo saat simpan.
  const catalog = ref([]);

  // Muat & kelompokkan komponen dari daftar payslip terpilih.
  // `payslipRows`: objek payslip (butuh id & employee.fullName).
  async function loadCatalog(payslipRows) {
    loading.value = true;
    catalog.value = [];
    const byCode = new Map();
    try {
      for (const p of payslipRows) {
        const res = await client.query({
          query: LIST_PAYSLIP_ITEM,
          variables: { params: { payslip: Number(p.id), pageSize: 200 } },
          fetchPolicy: "network-only",
        });
        const items = res?.data?.listPayslipItem?.data?.results ?? [];
        for (const it of items) {
          if (it.kind === "ADJUSTMENT") continue; // hanya komponen otomatis
          const code = it.code;
          if (!code) continue;
          if (!byCode.has(code)) {
            byCode.set(code, {
              code,
              kind: it.kind,
              category: it.category ?? null,
              rows: [],
            });
          }
          byCode.get(code).rows.push({
            payslipId: Number(p.id),
            employeeName: p.employee?.fullName ?? "-",
            // Simpan item asli utuh agar bisa di-echo balik saat simpan (sama
            // seperti editPayslipItem) — tak ada field yang hilang.
            item: it,
          });
        }
      }
      catalog.value = [...byCode.values()].sort((a, b) =>
        a.code.localeCompare(b.code),
      );
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal memuat komponen slip.");
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Simpan beberapa item sekaligus. Tiap `draft` membawa field asli item
  // (di-echo balik persis seperti editPayslipItem) + note/amount hasil edit.
  // `draft`: { id, payslipId, kind, code, componentTypeId, category, order,
  //            base, dailyRate, paidDays, prorated, note, amount }.
  async function saveDrafts(drafts) {
    saving.value = true;
    try {
      const payload = drafts.map((d) => ({
        id: Number(d.id),
        payslipId: d.payslipId != null ? Number(d.payslipId) : null,
        kind: d.kind || "ADJUSTMENT",
        code: d.code || d.kind,
        componentTypeId: d.componentTypeId ?? null,
        category: d.category ?? null,
        order: d.order ?? null,
        base: dec(d.base),
        dailyRate: dec(d.dailyRate),
        paidDays: d.paidDays ?? null,
        prorated: d.prorated ?? null,
        note: d.note?.trim() || null,
        amount: String(d.amount),
      }));
      const res = await bulkMut({ items: payload });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      const updated = res?.data?.bulkEditPayslipItem?.data?.length ?? payload.length;
      toast.success(`${updated} komponen diperbarui`);
      return true;
    } catch (e) {
      toast.error(cleanMessage(e) || "Gagal memperbarui komponen.");
      return false;
    } finally {
      saving.value = false;
    }
  }

  return { catalog, loading, saving, loadCatalog, saveDrafts };
}
