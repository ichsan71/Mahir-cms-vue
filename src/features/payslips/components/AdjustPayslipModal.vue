<script setup>
// Modal "Item Penyesuaian Slip Gaji" — kelola line-item slip (draft).
// Komponen otomatis (kind ≠ ADJUSTMENT: EARNING/DEDUCTION/BPJS/TAX) kini bisa
// diedit (nominal + keterangan) & disimpan — field aslinya di-echo balik.
// Item manual (kind = ADJUSTMENT) bisa ditambah/edit/hapus via CRUD.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { formatDate } from "@/shared/utils/format";
import { usePayslipItems } from "../composables/usePayslipItems";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { PERM } from "../permissions";
import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
  payslip: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "changed"]);

const auth = useAuthStore();
const canCreate = computed(() => auth.can(PERM.ITEM_CREATE));
const canEdit = computed(() => auth.can(PERM.ITEM_EDIT));
const canDelete = computed(() => auth.can(PERM.ITEM_DELETE));

const payslipId = computed(() => props.payslip?.id ?? null);
const openRef = computed(() => props.open);

const { items, manualItems, autoItems, loading, saving, create, save, remove } = usePayslipItems(
  payslipId,
  openRef,
);

// ── Util angka ────────────────────────────────────────────────────────────────
// Decimal backend kadang notasi ilmiah ("7.5E+5") → ubah ke angka biasa.
function plainAmount(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
}
// Saring input: hanya digit, satu titik desimal, minus di depan.
function sanitizeAmount(v) {
  let s = String(v ?? "").replace(/[^\d.-]/g, "");
  const neg = s.startsWith("-");
  s = s.replace(/-/g, "");
  const [head, ...rest] = s.split(".");
  s = head + (rest.length ? `.${rest.join("")}` : "");
  return (neg ? "-" : "") + s;
}
function isValidAmount(v) {
  return v !== "" && v !== null && v !== "-" && Number.isFinite(Number(v));
}
function money(v) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(Number(v) || 0));
}
function signed(v) {
  const n = Number(v) || 0;
  return `${n < 0 ? "−" : "+"}${money(Math.abs(n))}`;
}

// ── Label jenis komponen (kind) ───────────────────────────────────────────────
const KIND_META = {
  EARNING: { label: "Pendapatan", cls: "bg-emerald-50 text-emerald-600" },
  DEDUCTION: { label: "Potongan", cls: "bg-red-50 text-red-500" },
  BPJS_EMPLOYEE: { label: "BPJS Karyawan", cls: "bg-sky-50 text-sky-600" },
  BPJS_EMPLOYER: { label: "BPJS Perusahaan", cls: "bg-indigo-50 text-indigo-600" },
  TAX: { label: "Pajak", cls: "bg-amber-50 text-amber-600" },
  ADJUSTMENT: { label: "Penyesuaian", cls: "bg-slate-100 text-slate-500" },
};
function kindMeta(k) {
  return KIND_META[k] || { label: k || "—", cls: "bg-slate-100 text-slate-500" };
}

// ── Draft editable (disinkronkan ulang tiap data berubah) ─────────────────────
// Simpan seluruh field asli (untuk di-echo saat save) + note/amount editable.
function toDraft(i) {
  return { ...i, note: i.note ?? "", amount: plainAmount(i.amount) };
}
const autoDrafts = ref([]);
const manualDrafts = ref([]);
watch(autoItems, (list) => (autoDrafts.value = list.map(toDraft)), { immediate: true });
watch(manualItems, (list) => (manualDrafts.value = list.map(toDraft)), { immediate: true });

// Peta item asli (by id) untuk deteksi perubahan baris.
const byId = computed(() => new Map(items.value.map((i) => [i.id, i])));
function isDirty(d) {
  const o = byId.value.get(d.id);
  if (!o) return true;
  return (o.note ?? "") !== d.note || plainAmount(o.amount) !== String(d.amount);
}

// Form item manual baru.
const newItem = ref({ note: "", amount: "" });

// Pilihan jenis komponen otomatis dari enum backend PAYSLIP_ITEM_KIND (value =
// nama enum). ADJUSTMENT dikecualikan (khusus item manual). Label tampilan lewat
// KIND_META agar terbaca ("Pendapatan", dst.), fallback ke nama enum.
const { options: kindChoices } = useEnumChoices("PAYSLIP_ITEM_KIND");
const autoKindOptions = computed(() =>
  kindChoices.value
    .filter((o) => o.value !== "ADJUSTMENT")
    .map((o) => ({ value: o.value, label: kindMeta(o.value).label })),
);
// Kategori komponen otomatis baru = freetext (field `category` String bebas di
// backend) — ikut dibawa ke mutation create untuk menggolongkan komponen baru.
const newAuto = ref({ kind: "EARNING", category: "", note: "", amount: "" });

// ── Total (net) ───────────────────────────────────────────────────────────────
// Nominal disimpan positif; arah terhadap gaji bersih ditentukan `kind`.
// EARNING/ADJUSTMENT menambah; DEDUCTION/BPJS_EMPLOYEE/TAX mengurangi;
// BPJS_EMPLOYER tidak memotong gaji (0).
const SIGN = { EARNING: 1, ADJUSTMENT: 1, DEDUCTION: -1, BPJS_EMPLOYEE: -1, TAX: -1, BPJS_EMPLOYER: 0 };
function netOf(d) {
  return (SIGN[d.kind] ?? 1) * (Number(d.amount) || 0);
}
const autoTotal = computed(() => autoDrafts.value.reduce((s, d) => s + netOf(d), 0));
const manualTotal = computed(() => manualDrafts.value.reduce((s, d) => s + netOf(d), 0));
const grandTotal = computed(() => autoTotal.value + manualTotal.value);

// ── Aksi ──────────────────────────────────────────────────────────────────────
async function onSaveRow(d) {
  if (!isValidAmount(d.amount)) return;
  const ok = await save(d);
  if (ok) emit("changed");
}
async function onAdd() {
  if (!isValidAmount(newItem.value.amount)) return;
  const ok = await create({ note: newItem.value.note, amount: Number(newItem.value.amount) });
  if (ok) {
    newItem.value = { note: "", amount: "" };
    emit("changed");
  }
}
async function onAddAuto() {
  if (!isValidAmount(newAuto.value.amount)) return;
  const ok = await create({
    kind: newAuto.value.kind,
    category: newAuto.value.category,
    note: newAuto.value.note,
    amount: Number(newAuto.value.amount),
  });
  if (ok) {
    newAuto.value = { kind: "EARNING", category: "", note: "", amount: "" };
    emit("changed");
  }
}
async function onRemoveRow(d) {
  const ok = await remove(d.id);
  if (ok) emit("changed");
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3.5 py-2.5 text-[15px] focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary disabled:bg-slate-50 disabled:text-slate-400";
const labelCls = "mb-2 block text-sm font-semibold text-slate-700";
const saveBtnCls =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mahir-primary/10 text-mahir-primary hover:bg-mahir-primary/20 disabled:opacity-40";
const delBtnCls =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50";
const addBtnCls =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mahir-primary text-white hover:bg-mahir-primary/90 disabled:opacity-50";
</script>

<template>
  <BaseModal
    :open="open"
    title="Item Penyesuaian Slip Gaji"
    size="2xl"
    submit-text="Selesai"
    @update:open="emit('update:open', $event)"
    @submit="emit('update:open', false)"
  >
    <div class="space-y-6">
      <div v-if="payslip" class="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
        <span class="font-semibold text-slate-800">{{ payslip.employee?.fullName ?? "-" }}</span>
        — periode {{ formatDate(payslip.periodStart) }} s/d {{ formatDate(payslip.periodEnd) }}
      </div>

      <p v-if="loading && !items.length" class="text-sm text-slate-400">Memuat item…</p>

      <!-- Komponen otomatis (editable) -->
      <div v-if="autoDrafts.length || canCreate">
        <label :class="labelCls">Komponen Otomatis</label>
        <div class="overflow-x-auto rounded-xl border border-mahir-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-mahir-border bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th class="px-3 py-2.5 font-semibold">Komponen</th>
                <th class="px-3 py-2.5 font-semibold">Jenis</th>
                <th class="px-3 py-2.5 font-semibold">Kategori</th>
                <th class="px-3 py-2.5 font-semibold">Keterangan</th>
                <th class="px-3 py-2.5 text-right font-semibold">Nominal</th>
                <th class="w-28 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in autoDrafts" :key="d.id" class="border-b border-mahir-border/60 last:border-0">
                <td class="px-3 py-2 align-top">
                  <div class="font-medium text-slate-700">{{ d.code || "—" }}</div>
                  <span v-if="d.prorated" class="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">prorata</span>
                </td>
                <td class="px-3 py-2 align-top">
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="kindMeta(d.kind).cls"
                  >
                    {{ kindMeta(d.kind).label }}
                  </span>
                </td>
                <td class="px-3 py-2 align-top">
                  <span
                    v-if="d.category"
                    class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    :class="categoryBadgeClass(d.category)"
                  >
                    {{ categoryLabel(d.category) }}
                  </span>
                  <span v-else class="text-[12px] text-slate-300">—</span>
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    v-model="d.note"
                    type="text"
                    :class="fieldCls"
                    placeholder="Keterangan (opsional)"
                    :disabled="!canEdit"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    :value="d.amount"
                    type="text"
                    inputmode="decimal"
                    :class="fieldCls"
                    class="text-right"
                    :disabled="!canEdit"
                    @input="d.amount = sanitizeAmount($event.target.value)"
                  />
                </td>
                <td class="px-2 py-2 align-top">
                  <div class="flex items-center gap-1.5">
                    <button
                      v-if="canEdit"
                      type="button"
                      :class="saveBtnCls"
                      :title="isDirty(d) ? 'Simpan perubahan' : 'Tidak ada perubahan'"
                      :disabled="saving || !isValidAmount(d.amount) || !isDirty(d)"
                      @click="onSaveRow(d)"
                    >
                      <CheckIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="canDelete"
                      type="button"
                      :class="delBtnCls"
                      title="Hapus komponen dari slip ini (tidak menghapus master)"
                      :disabled="saving"
                      @click="onRemoveRow(d)"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Baris tambah komponen otomatis baru (menyatu dengan tabel) -->
              <tr v-if="canCreate" class="border-t border-mahir-border bg-slate-50/40">
                <td class="px-3 py-2 text-center align-middle">
                  <span class="inline-block rounded-full bg-mahir-primary/10 px-2 py-0.5 text-[10px] font-semibold text-mahir-primary">Tambah Baru</span>
                </td>
                <td class="px-3 py-2 align-top">
                  <select v-model="newAuto.kind" :class="fieldCls">
                    <option v-for="opt in autoKindOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    v-model="newAuto.category"
                    type="text"
                    :class="fieldCls"
                    placeholder="Kategori (opsional)"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    v-model="newAuto.note"
                    type="text"
                    :class="fieldCls"
                    placeholder="Keterangan komponen baru"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    :value="newAuto.amount"
                    type="text"
                    inputmode="decimal"
                    :class="fieldCls"
                    class="text-right"
                    placeholder="Nominal"
                    @input="newAuto.amount = sanitizeAmount($event.target.value)"
                  />
                </td>
                <td class="px-2 py-2 align-top">
                  <button
                    type="button"
                    :class="addBtnCls"
                    title="Tambah komponen"
                    :disabled="saving || !isValidAmount(newAuto.amount)"
                    @click="onAddAuto"
                  >
                    <PlusIcon class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="autoDrafts.length">
              <tr class="border-t-2 border-mahir-border bg-slate-50/60">
                <td class="px-3 py-2.5 text-[13px] font-semibold text-slate-600" colspan="4">
                  Subtotal (pendapatan − potongan/BPJS/pajak)
                </td>
                <td class="px-3 py-2.5 text-right font-bold" :class="autoTotal < 0 ? 'text-mahir-danger' : 'text-slate-800'">
                  {{ signed(autoTotal) }}
                </td>
                <td class="px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p class="mt-1.5 text-[12px] text-mahir-muted">
          Komponen ini dihitung otomatis oleh sistem; ubah nominal/keterangan bila perlu koreksi, lalu simpan per baris.
        </p>
      </div>

      <!-- Item penyesuaian manual (editable) -->
      <div>
        <label :class="labelCls">Item Penyesuaian Manual</label>
        <div v-if="manualDrafts.length || canCreate" class="overflow-x-auto rounded-xl border border-mahir-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-mahir-border bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th class="px-3 py-2.5 font-semibold">Keterangan</th>
                <th class="px-3 py-2.5 text-right font-semibold">Nominal</th>
                <th class="w-28 px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in manualDrafts" :key="d.id" class="border-b border-mahir-border/60 last:border-0">
                <td class="px-3 py-2 align-top">
                  <input
                    v-model="d.note"
                    type="text"
                    :class="fieldCls"
                    placeholder="Keterangan (mis. Bonus, Potongan pinjaman)"
                    :disabled="!canEdit"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    :value="d.amount"
                    type="text"
                    inputmode="decimal"
                    :class="fieldCls"
                    class="text-right"
                    placeholder="mis. 50000"
                    :disabled="!canEdit"
                    @input="d.amount = sanitizeAmount($event.target.value)"
                  />
                </td>
                <td class="px-2 py-2 align-top">
                  <div class="flex items-center gap-1.5">
                    <button
                      v-if="canEdit"
                      type="button"
                      :class="saveBtnCls"
                      :title="isDirty(d) ? 'Simpan perubahan' : 'Tidak ada perubahan'"
                      :disabled="saving || !isValidAmount(d.amount) || !isDirty(d)"
                      @click="onSaveRow(d)"
                    >
                      <CheckIcon class="h-4 w-4" />
                    </button>
                    <button
                      v-if="canDelete"
                      type="button"
                      :class="delBtnCls"
                      title="Hapus item"
                      :disabled="saving"
                      @click="onRemoveRow(d)"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Baris tambah item penyesuaian manual (menyatu dengan tabel) -->
              <tr v-if="canCreate" class="border-t border-mahir-border bg-slate-50/40">
                <td class="px-3 py-2 align-top">
                  <input
                    v-model="newItem.note"
                    type="text"
                    :class="fieldCls"
                    placeholder="Keterangan item baru (mis. Bonus kinerja)"
                  />
                </td>
                <td class="px-3 py-2 align-top">
                  <input
                    :value="newItem.amount"
                    type="text"
                    inputmode="decimal"
                    :class="fieldCls"
                    class="text-right"
                    placeholder="Nominal (± )"
                    @input="newItem.amount = sanitizeAmount($event.target.value)"
                  />
                </td>
                <td class="px-2 py-2 align-top">
                  <button
                    type="button"
                    :class="addBtnCls"
                    title="Tambah item"
                    :disabled="saving || !isValidAmount(newItem.amount)"
                    @click="onAdd"
                  >
                    <PlusIcon class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="manualDrafts.length">
              <tr class="border-t-2 border-mahir-border bg-slate-50/60">
                <td class="px-3 py-2.5 text-[13px] font-semibold text-slate-600">Total penyesuaian manual</td>
                <td class="px-3 py-2.5 text-right font-bold" :class="manualTotal < 0 ? 'text-mahir-danger' : 'text-slate-800'">
                  {{ signed(manualTotal) }}
                </td>
                <td class="px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p v-else-if="!loading" class="text-[13px] text-slate-400">
          Belum ada item penyesuaian manual.
        </p>

        <p class="mt-2 text-[12px] text-mahir-muted">
          Nilai positif menambah, negatif mengurangi gaji bersih (net pay).
        </p>
      </div>

      <!-- Total keseluruhan (≈ gaji bersih) -->
      <div class="flex items-center justify-between rounded-xl border border-mahir-border bg-mahir-primary/5 px-4 py-3">
        <div>
          <span class="text-sm font-semibold text-slate-700">Estimasi Gaji Bersih</span>
          <p class="text-[12px] text-mahir-muted">Komponen otomatis + penyesuaian (BPJS perusahaan tidak memotong).</p>
        </div>
        <span class="text-base font-bold" :class="grandTotal < 0 ? 'text-mahir-danger' : 'text-mahir-primary'">
          {{ money(grandTotal) }}
        </span>
      </div>
    </div>
  </BaseModal>
</template>
