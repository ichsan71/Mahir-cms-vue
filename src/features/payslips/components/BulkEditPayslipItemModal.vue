<script setup>
// Modal "Edit Komponen Massal" — edit satu komponen otomatis yang sama pada
// beberapa slip gaji (draf) sekaligus via bulkEditPayslipItem. Setara dengan
// edit per-orang (AdjustPayslipModal): keterangan + nominal bisa diubah per
// baris, badge Jenis (kind) & Kategori ditampilkan, dan semua field asli
// di-echo balik saat simpan. Ada input cepat "terapkan nominal ke semua".
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { usePayslipBulkEdit } from "../composables/usePayslipBulkEdit";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";

const props = defineProps({
  open: { type: Boolean, default: false },
  // Baris payslip terpilih (butuh id & employee.fullName).
  payslips: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:open", "changed"]);

const { catalog, loading, saving, loadCatalog, saveDrafts } = usePayslipBulkEdit();

// Komponen terpilih (by code) + draft baris editable.
const selectedCode = ref("");
const drafts = ref([]); // [{ ...item, payslipId, employeeName, note, amount }]
const bulkAmount = ref(""); // input cepat "terapkan ke semua"

const selectedComp = computed(() => catalog.value.find((c) => c.code === selectedCode.value) ?? null);
const affectedCount = computed(() => drafts.value.length);

// Opsi komponen untuk SearchableSelect ({ id, name }), difilter lokal dari
// katalog sesuai kata kunci (SearchableSelect tak memfilter sendiri).
const componentSearch = ref("");
function optionLabel(c) {
  return `${c.code} — ${kindMeta(c.kind).label}`;
}
const componentOptions = computed(() => {
  const q = componentSearch.value.toLowerCase();
  return catalog.value
    .filter((c) => !q || optionLabel(c).toLowerCase().includes(q))
    .map((c) => ({ id: c.code, name: optionLabel(c) }));
});
const selectedOption = computed(() =>
  selectedComp.value
    ? { id: selectedComp.value.code, name: optionLabel(selectedComp.value) }
    : null,
);

// ── Util angka (samakan dgn AdjustPayslipModal) ──────────────────────────────
function plainAmount(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
}
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

const KIND_META = {
  EARNING: { label: "Pendapatan", cls: "bg-emerald-50 text-emerald-600" },
  DEDUCTION: { label: "Potongan", cls: "bg-red-50 text-red-500" },
  BPJS_EMPLOYEE: { label: "BPJS Karyawan", cls: "bg-sky-50 text-sky-600" },
  BPJS_EMPLOYER: { label: "BPJS Perusahaan", cls: "bg-indigo-50 text-indigo-600" },
  TAX: { label: "Pajak", cls: "bg-amber-50 text-amber-600" },
};
function kindMeta(k) {
  return KIND_META[k] || { label: k || "—", cls: "bg-slate-100 text-slate-500" };
}

// Bangun draft editable dari komponen terpilih (echo seluruh field item asli).
function buildDrafts(comp) {
  if (!comp) return [];
  return comp.rows.map((r) => ({
    ...r.item,
    payslipId: r.payslipId,
    employeeName: r.employeeName,
    note: r.item.note ?? "",
    amount: plainAmount(r.item.amount),
  }));
}

// Isi semua nominal baris dengan input cepat.
function applyBulkAmount() {
  if (!isValidAmount(bulkAmount.value)) return;
  drafts.value.forEach((d) => (d.amount = String(bulkAmount.value)));
}

// Muat katalog tiap kali modal dibuka dgn seleksi baru.
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    selectedCode.value = "";
    bulkAmount.value = "";
    drafts.value = [];
    await loadCatalog(props.payslips);
    if (catalog.value.length === 1) selectedCode.value = catalog.value[0].code;
  },
  { immediate: true },
);

// Rebuild draft saat komponen berganti.
watch(selectedComp, (comp) => {
  drafts.value = buildDrafts(comp);
  bulkAmount.value = "";
});

const canSave = computed(
  () => affectedCount.value > 0 && drafts.value.every((d) => isValidAmount(d.amount)),
);

async function onSave() {
  if (!canSave.value) return;
  const ok = await saveDrafts(drafts.value);
  if (ok) {
    emit("changed");
    emit("update:open", false);
  }
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-2 block text-sm font-semibold text-slate-700";
</script>

<template>
  <BaseModal
    :open="open"
    title="Edit Komponen Massal"
    size="xl"
    submit-text="Simpan Semua"
    :loading="saving"
    :submit-disabled="!canSave"
    @update:open="emit('update:open', $event)"
    @submit="onSave"
  >
    <div class="space-y-5">
      <div class="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
        Edit satu komponen otomatis yang sama (keterangan &amp; nominal) pada semua slip terpilih sekaligus.
      </div>

      <p v-if="loading" class="text-sm text-slate-400">Memuat komponen…</p>

      <p
        v-else-if="!catalog.length"
        class="rounded-lg border border-dashed border-mahir-border py-8 text-center text-sm text-slate-400"
      >
        Tidak ada komponen otomatis yang dapat diedit pada slip terpilih.
      </p>

      <template v-else>
        <!-- Pilih komponen (dapat dicari) -->
        <div>
          <label :class="labelCls">Komponen</label>
          <SearchableSelect
            v-model="selectedCode"
            :selected="selectedOption"
            :options="componentOptions"
            placeholder="Pilih komponen…"
            search-placeholder="Cari komponen…"
            @search="componentSearch = $event"
          />
        </div>

        <template v-if="selectedComp">
          <!-- Info jenis + input cepat -->
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="flex items-center gap-2">
              <span
                class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :class="kindMeta(selectedComp.kind).cls"
              >
                {{ kindMeta(selectedComp.kind).label }}
              </span>
              <span
                v-if="selectedComp.category"
                class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :class="categoryBadgeClass(selectedComp.category)"
              >
                {{ categoryLabel(selectedComp.category) }}
              </span>
            </div>
            <div class="flex items-end gap-2">
              <div>
                <label class="mb-1 block text-[12px] font-medium text-slate-500">Terapkan nominal ke semua</label>
                <input
                  :value="bulkAmount"
                  type="text"
                  inputmode="decimal"
                  :class="fieldCls"
                  class="!w-40 text-right"
                  placeholder="mis. 500000"
                  @input="bulkAmount = sanitizeAmount($event.target.value)"
                />
              </div>
              <button
                type="button"
                class="h-[38px] shrink-0 rounded-lg bg-mahir-primary/10 px-3 text-sm font-semibold text-mahir-primary hover:bg-mahir-primary/20 disabled:opacity-40"
                :disabled="!isValidAmount(bulkAmount)"
                @click="applyBulkAmount"
              >
                Isi semua
              </button>
            </div>
          </div>

          <!-- Tabel baris editable (per karyawan) -->
          <div class="overflow-x-auto rounded-xl border border-mahir-border">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-mahir-border bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th class="px-3 py-2.5 font-semibold">Karyawan</th>
                  <th class="px-3 py-2.5 font-semibold">Jenis</th>
                  <th class="px-3 py-2.5 font-semibold">Keterangan</th>
                  <th class="px-3 py-2.5 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="d in drafts"
                  :key="d.id"
                  class="border-b border-mahir-border/60 last:border-0"
                >
                  <td class="px-3 py-2 align-top font-medium text-slate-700">{{ d.employeeName }}</td>
                  <td class="px-3 py-2 align-top">
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      :class="kindMeta(d.kind).cls"
                    >
                      {{ kindMeta(d.kind).label }}
                    </span>
                  </td>
                  <td class="px-3 py-2 align-top">
                    <input
                      v-model="d.note"
                      type="text"
                      :class="fieldCls"
                      placeholder="Keterangan (opsional)"
                    />
                  </td>
                  <td class="px-3 py-2 align-top">
                    <input
                      :value="d.amount"
                      type="text"
                      inputmode="decimal"
                      :class="fieldCls"
                      class="text-right"
                      @input="d.amount = sanitizeAmount($event.target.value)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-[12px] text-mahir-muted">
            Field lain (jenis, kategori, basis, prorata, dst.) dipertahankan sesuai perhitungan asli
            tiap slip — hanya keterangan &amp; nominal yang diubah.
          </p>
        </template>
      </template>
    </div>
  </BaseModal>
</template>
