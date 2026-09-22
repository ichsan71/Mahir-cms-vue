<script setup>
// Tab "Pajak" pada Detail Karyawan. Info pajak bersifat 1:1 per karyawan, dibaca
// dari `employee.taxInfo` (GET_EMPLOYEE). Bila belum ada → tombol Tambah; bila
// sudah ada → detail + tombol Edit. Setelah simpan memancarkan `saved` agar
// halaman induk me-refetch.
//
// Catatan: `ptkpStatus` & `taxMethod` di backend bertipe String bebas. Daftar
// pilihan di bawah adalah nilai umum di Indonesia — sesuaikan bila backend
// memakai kode lain.
import { computed, ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { CREATE_EMPLOYEE_TAX_INFO, EDIT_EMPLOYEE_TAX_INFO } from "../graphql/taxInfo.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import { DocumentTextIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  employee: { type: Object, default: null },
});
const emit = defineEmits(["saved"]);

const auth = useAuthStore();
const toast = useToastStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

const taxInfo = computed(() => props.employee?.taxInfo ?? null);
const hasTax = computed(() => !!taxInfo.value?.id);

const canCreate = computed(() => auth.can(PERM.TAX_CREATE));
const canEdit = computed(() => auth.can(PERM.TAX_EDIT));

// Status PTKP umum di Indonesia (Tidak Kawin / Kawin / Kawin+penghasilan istri).
const PTKP_STATUSES = [
  "TK/0", "TK/1", "TK/2", "TK/3",
  "K/0", "K/1", "K/2", "K/3",
  "K/I/0", "K/I/1", "K/I/2", "K/I/3",
];
// Metode perhitungan pajak umum.
const TAX_METHODS = [
  { value: "GROSS", label: "Gross (pajak ditanggung karyawan)" },
  { value: "GROSS_UP", label: "Gross Up (tunjangan pajak)" },
  { value: "NETT", label: "Nett (pajak ditanggung perusahaan)" },
];

function taxMethodLabel(value) {
  if (!value) return "-";
  return TAX_METHODS.find((m) => m.value === value)?.label ?? value;
}

// ── Modal ────────────────────────────────────────────────────────────────────
const modalOpen = ref(false);

const blankForm = () => ({
  npwp: "",
  npwpRegisteredDate: "",
  isNpwpActive: true,
  ptkpStatus: "",
  taxMethod: "GROSS",
  ptkpDependents: "",
});
const form = ref(blankForm());

function openForm() {
  const t = taxInfo.value;
  form.value = t
    ? {
        npwp: t.npwp ?? "",
        npwpRegisteredDate: t.npwpRegisteredDate ? String(t.npwpRegisteredDate).slice(0, 10) : "",
        isNpwpActive: t.isNpwpActive ?? true,
        ptkpStatus: t.ptkpStatus ?? "",
        taxMethod: t.taxMethod ?? "GROSS",
        ptkpDependents: t.ptkpDependents ?? "",
      }
    : blankForm();
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) form.value = blankForm();
});

const { mutate: createTax, loading: creating } = useMutation(CREATE_EMPLOYEE_TAX_INFO);
const { mutate: editTax, loading: editingSave } = useMutation(EDIT_EMPLOYEE_TAX_INFO);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (hasTax.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const dependents = Number(f.ptkpDependents);
  const input = {
    employeeId: employeeId.value,
    npwp: f.npwp?.trim() || null,
    npwpRegisteredDate: f.npwpRegisteredDate || null,
    isNpwpActive: !!f.isNpwpActive,
    ptkpStatus: f.ptkpStatus?.trim() || null,
    taxMethod: f.taxMethod?.trim() || null,
    ptkpDependents: Number.isFinite(dependents) && String(f.ptkpDependents).trim() !== "" ? dependents : null,
  };

  try {
    if (hasTax.value) {
      const res = await editTax({ id: Number(taxInfo.value.id), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeTaxInfo?.data) throw new Error("Gagal menyimpan info pajak");
    } else {
      const res = await createTax({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeTaxInfo?.data) throw new Error("Gagal menyimpan info pajak");
    }
    toast.success("Info pajak berhasil disimpan");
    modalOpen.value = false;
    emit("saved");
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan info pajak. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
            <DocumentTextIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Info Pajak</h2>
            <p class="text-[11.5px] text-slate-400">NPWP &amp; status PTKP</p>
          </div>
        </div>

        <button
          v-if="hasTax ? canEdit : canCreate"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
          @click="openForm"
        >
          <component :is="hasTax ? PencilSquareIcon : PlusIcon" class="h-4 w-4" />
          {{ hasTax ? "Edit" : "Tambah" }}
        </button>
      </div>

      <div class="p-5">
        <!-- Kosong -->
        <div v-if="!hasTax" class="py-12 text-center text-sm text-slate-400">
          Belum ada info pajak untuk karyawan ini.
        </div>

        <!-- Detail -->
        <dl v-else class="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
            <dt class="text-slate-400">NPWP</dt>
            <dd class="font-medium text-slate-700">
              {{ taxInfo.npwp || "-" }}
              <span
                v-if="taxInfo.npwp"
                class="ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="taxInfo.isNpwpActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
              >
                {{ taxInfo.isNpwpActive ? "Aktif" : "Nonaktif" }}
              </span>
            </dd>
          </div>
          <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
            <dt class="text-slate-400">Tgl Terdaftar NPWP</dt>
            <dd class="font-medium text-slate-700">{{ taxInfo.npwpRegisteredDate ? formatDate(taxInfo.npwpRegisteredDate) : "-" }}</dd>
          </div>
          <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
            <dt class="text-slate-400">Status PTKP</dt>
            <dd class="font-medium text-slate-700">{{ taxInfo.ptkpStatus || "-" }}</dd>
          </div>
          <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2">
            <dt class="text-slate-400">Tanggungan</dt>
            <dd class="font-medium text-slate-700">{{ taxInfo.ptkpDependents ?? "-" }}</dd>
          </div>
          <div class="flex justify-between gap-3 border-b border-mahir-border/60 pb-2 sm:col-span-2">
            <dt class="text-slate-400">Metode Pajak</dt>
            <dd class="font-medium text-slate-700">{{ taxMethodLabel(taxInfo.taxMethod) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Modal tambah / edit info pajak -->
    <BaseModal
      :open="modalOpen"
      :title="hasTax ? 'Edit Info Pajak' : 'Tambah Info Pajak'"
      size="lg"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label :class="labelCls">NPWP</label>
          <input v-model="form.npwp" type="text" :class="fieldCls" placeholder="Nomor NPWP" />
        </div>
        <div>
          <label :class="labelCls">Tanggal Terdaftar NPWP</label>
          <input v-model="form.npwpRegisteredDate" type="date" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Status PTKP</label>
          <select v-model="form.ptkpStatus" :class="fieldCls">
            <option value="">—</option>
            <option v-for="s in PTKP_STATUSES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div>
          <label :class="labelCls">Jumlah Tanggungan</label>
          <input v-model="form.ptkpDependents" type="number" min="0" :class="fieldCls" placeholder="0" />
        </div>
        <div class="md:col-span-2">
          <label :class="labelCls">Metode Pajak</label>
          <select v-model="form.taxMethod" :class="fieldCls">
            <option v-for="m in TAX_METHODS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
      </div>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
        <input v-model="form.isNpwpActive" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">NPWP aktif</span>
          <span class="block text-[12px] text-mahir-muted">Nonaktifkan bila NPWP karyawan sudah tidak berlaku.</span>
        </span>
      </label>
    </BaseModal>
  </div>
</template>
