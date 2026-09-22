<script setup>
// Tab "Struktur Gaji" pada Detail Karyawan. Menampilkan struktur gaji milik
// karyawan yang sedang dibuka (listEmployeeSalary difilter employeeIds) beserta
// komponen-komponennya, plus aksi Tambah/Edit/Hapus. Nilai `takeHome` dihitung
// oleh backend. Komponen dipilih dari katalog Komponen Penggajian (Fase 1).
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_EMPLOYEE_SALARY,
  CREATE_EMPLOYEE_SALARY,
  EDIT_EMPLOYEE_SALARY,
  DELETE_EMPLOYEE_SALARY,
} from "../graphql/salary.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useSalaryComponentTypeSearch } from "@/features/salaryComponentTypes/composables/useSalaryComponentTypeSearch";
import { categoryLabel, categoryBadgeClass } from "@/features/salaryComponentTypes/constants";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import {
  BanknotesIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — strukturnya diambil via employeeId.
  employee: { type: Object, default: null },
});

const auth = useAuthStore();
const toast = useToastStore();

// Periode pembayaran — String bebas di backend; daftar ini sekadar pilihan UI.
const PAY_PERIODS = [
  { value: "MONTHLY", label: "Bulanan" },
  { value: "WEEKLY", label: "Mingguan" },
  { value: "DAILY", label: "Harian" },
];

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

// ── Daftar struktur gaji karyawan ini ────────────────────────────────────────
const page = ref(1);
const pageSize = ref(10);

watch(employeeId, () => {
  page.value = 1;
});

const { result, loading, refetch } = useQuery(
  LIST_EMPLOYEE_SALARY,
  () => ({
    params: {
      employeeIds: employeeId.value ? [employeeId.value] : null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listEmployeeSalary?.data ?? null);
const salaries = computed(() => data.value?.results ?? []);
const pagination = computed(() => {
  const count = data.value?.count ?? 0;
  const size = pageSize.value || 10;
  return {
    count,
    currentPage: data.value?.currentPage ?? page.value,
    totalPages: data.value?.totalPages ?? Math.max(1, Math.ceil(count / size)),
    hasNext: data.value?.hasNext ?? false,
    hasPrev: data.value?.hasPrev ?? false,
  };
});

function nextPage() {
  if (pagination.value.hasNext) page.value += 1;
}
function prevPage() {
  if (pagination.value.hasPrev) page.value -= 1;
}

const canCreate = computed(() => auth.can(PERM.SALARY_CREATE));
const canEdit = computed(() => auth.can(PERM.SALARY_EDIT));
const canDelete = computed(() => auth.can(PERM.SALARY_DELETE));

// Format angka dengan pemisah ribuan + kode mata uang (default IDR).
function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
  return `${currency || "IDR"} ${num}`;
}

function payPeriodLabel(value) {
  if (!value) return "-";
  return PAY_PERIODS.find((p) => p.value === value)?.label ?? value;
}

// ── Modal tambah / edit ──────────────────────────────────────────────────────
const { options: componentOptions, loading: componentLoading, setSearch: setComponentSearch } =
  useSalaryComponentTypeSearch();

const modalOpen = ref(false);
const editingId = ref(null); // null = mode tambah
const isEdit = computed(() => editingId.value != null);

const blankForm = () => ({
  effectiveDate: "",
  payPeriod: "MONTHLY",
  currency: "IDR",
  paymentMethod: "",
  isActive: true,
  notes: "",
});
const form = ref(blankForm());

// Baris komponen: { componentTypeId, value, notes, selected }
const rows = ref([]);

function blankRow() {
  return { componentTypeId: "", value: "", notes: "", selected: null };
}

function addRow() {
  rows.value.push(blankRow());
}
function removeRow(i) {
  rows.value.splice(i, 1);
}

// Estimasi total komponen (informasi saja — `takeHome` final dihitung backend).
const estimatedTotal = computed(() =>
  rows.value.reduce((sum, r) => {
    const n = Number(r.value);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0),
);

function openCreate() {
  editingId.value = null;
  form.value = blankForm();
  rows.value = [blankRow()];
  modalOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  form.value = {
    effectiveDate: row.effectiveDate ? String(row.effectiveDate).slice(0, 10) : "",
    payPeriod: row.payPeriod ?? "MONTHLY",
    currency: row.currency ?? "IDR",
    paymentMethod: row.paymentMethod ?? "",
    isActive: row.isActive ?? true,
    notes: row.notes ?? "",
  };
  rows.value = (row.components ?? []).map((c) => ({
    componentTypeId: c.componentType?.id ?? "",
    value: c.value ?? "",
    notes: c.notes ?? "",
    selected: c.componentType
      ? {
          id: c.componentType.id,
          name: c.componentType.code
            ? `${c.componentType.name} (${c.componentType.code})`
            : c.componentType.name,
        }
      : null,
  }));
  if (!rows.value.length) rows.value = [blankRow()];
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) {
    editingId.value = null;
    form.value = blankForm();
    rows.value = [];
  }
});

const { mutate: createSalary, loading: creating } = useMutation(CREATE_EMPLOYEE_SALARY);
const { mutate: editSalary, loading: editingSave } = useMutation(EDIT_EMPLOYEE_SALARY);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (isEdit.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const components = rows.value
    .filter((r) => r.componentTypeId && String(r.value).trim() !== "")
    .map((r) => ({
      componentTypeId: Number(r.componentTypeId),
      value: Number(r.value),
      notes: r.notes?.trim() || null,
    }));

  const input = {
    employeeId: employeeId.value,
    effectiveDate: f.effectiveDate || null,
    payPeriod: f.payPeriod || null,
    currency: f.currency?.trim() || null,
    paymentMethod: f.paymentMethod?.trim() || null,
    isActive: !!f.isActive,
    notes: f.notes?.trim() || null,
    components,
  };

  try {
    if (isEdit.value) {
      const res = await editSalary({ editEmployeeSalaryId: Number(editingId.value), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeSalary?.data) throw new Error("Gagal menyimpan struktur gaji");
    } else {
      const res = await createSalary({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeSalary?.data) throw new Error("Gagal menyimpan struktur gaji");
    }
    toast.success("Struktur gaji berhasil disimpan");
    modalOpen.value = false;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan struktur gaji. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

// ── Hapus ────────────────────────────────────────────────────────────────────
const { mutate: deleteSalaryMut, loading: deleting } = useMutation(DELETE_EMPLOYEE_SALARY);
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () =>
    `Hapus struktur gaji berlaku ${formatDate(deleteTarget.value?.effectiveDate)}? Tindakan ini dapat memengaruhi penggajian terkait.`,
);

function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  try {
    const res = await deleteSalaryMut({
      deleteEmployeeSalaryId: Number(deleteTarget.value.id),
      hard: false,
    });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    toast.success("Struktur gaji berhasil dihapus");
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menghapus struktur gaji. Coba lagi.";
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
            <BanknotesIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Struktur Gaji</h2>
            <p class="text-[11.5px] text-slate-400">{{ pagination.count }} struktur</p>
          </div>
        </div>

        <button
          v-if="canCreate"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
          @click="openCreate"
        >
          <PlusIcon class="h-4 w-4" /> Tambah
        </button>
      </div>

      <div class="p-5">
        <!-- Loading -->
        <div v-if="loading && !salaries.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat struktur gaji…
        </div>

        <!-- Kosong -->
        <div v-else-if="!salaries.length" class="py-12 text-center text-sm text-slate-400">
          Belum ada struktur gaji untuk karyawan ini.
        </div>

        <!-- Daftar struktur -->
        <div v-else class="space-y-4">
          <div
            v-for="s in salaries"
            :key="s.id"
            class="rounded-xl border border-mahir-border"
          >
            <!-- Ringkasan -->
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-mahir-border/70 px-4 py-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-slate-800">Berlaku {{ formatDate(s.effectiveDate) }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    :class="s.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ s.isActive ? "Aktif" : "Nonaktif" }}
                  </span>
                </div>
                <div class="mt-0.5 text-[12px] text-slate-400">
                  {{ payPeriodLabel(s.payPeriod) }} · {{ s.currency || "IDR" }}
                  <template v-if="s.paymentMethod"> · {{ s.paymentMethod }}</template>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-[11px] uppercase tracking-wide text-slate-400">Take Home</div>
                  <div class="text-sm font-bold text-slate-800">{{ money(s.takeHome, s.currency) }}</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    v-if="canEdit"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    title="Edit"
                    @click="openEdit(s)"
                  >
                    <PencilSquareIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="canDelete"
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    title="Hapus"
                    @click="openDelete(s)"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Komponen -->
            <div class="px-4 py-3">
              <div v-if="!s.components?.length" class="text-[13px] text-slate-400">Tidak ada komponen.</div>
              <table v-else class="w-full text-sm">
                <tbody>
                  <tr
                    v-for="c in s.components"
                    :key="c.id"
                    class="border-b border-mahir-border/50 last:border-0"
                  >
                    <td class="py-2 pr-3">
                      <span class="font-medium text-slate-700">{{ c.componentType?.name ?? "-" }}</span>
                      <span class="ml-1 text-[12px] text-slate-400">{{ c.componentType?.code }}</span>
                    </td>
                    <td class="py-2 pr-3">
                      <span
                        class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                        :class="categoryBadgeClass(c.componentType?.category)"
                      >
                        {{ categoryLabel(c.componentType?.category) }}
                      </span>
                    </td>
                    <td class="py-2 text-right font-semibold text-slate-800">
                      {{ money(c.value, s.currency) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="s.notes" class="mt-2 text-[12px] text-slate-500">{{ s.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / paginasi -->
      <div
        v-if="salaries.length"
        class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
      >
        <span class="text-[13px] text-mahir-muted"
          >Menampilkan {{ salaries.length }} dari {{ pagination.count }} struktur</span
        >
        <nav class="flex items-center gap-1">
          <button
            class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
            :disabled="!pagination.hasPrev"
            @click="prevPage"
          >
            ‹
          </button>
          <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
            {{ pagination.currentPage }}
          </span>
          <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
          <button
            class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
            :disabled="!pagination.hasNext"
            @click="nextPage"
          >
            ›
          </button>
        </nav>
      </div>
    </div>

    <!-- Modal tambah / edit struktur gaji -->
    <BaseModal
      :open="modalOpen"
      :title="isEdit ? 'Edit Struktur Gaji' : 'Tambah Struktur Gaji'"
      size="xl"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="space-y-5">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label :class="labelCls">Karyawan</label>
            <input
              :value="employee?.fullName ?? '-'"
              type="text"
              disabled
              :class="[fieldCls, 'cursor-not-allowed bg-slate-50 text-slate-500']"
            />
          </div>
          <div>
            <label :class="labelCls">Tanggal Berlaku *</label>
            <input v-model="form.effectiveDate" type="date" required :class="fieldCls" />
          </div>
          <div>
            <label :class="labelCls">Periode Pembayaran</label>
            <select v-model="form.payPeriod" :class="fieldCls">
              <option v-for="p in PAY_PERIODS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelCls">Mata Uang</label>
            <input v-model="form.currency" type="text" :class="fieldCls" placeholder="IDR" />
          </div>
          <div>
            <label :class="labelCls">Metode Pembayaran</label>
            <input v-model="form.paymentMethod" type="text" :class="fieldCls" placeholder="mis. Transfer Bank" />
          </div>
        </div>

        <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
          <input v-model="form.isActive" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Struktur aktif</span>
            <span class="block text-[12px] text-mahir-muted">Struktur gaji yang dipakai untuk perhitungan penggajian.</span>
          </span>
        </label>

        <!-- Komponen -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-semibold text-slate-700">Komponen Gaji</label>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-mahir-border px-2.5 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
              @click="addRow"
            >
              <PlusIcon class="h-4 w-4" /> Tambah Komponen
            </button>
          </div>

          <div v-if="!rows.length" class="rounded-lg border border-dashed border-mahir-border py-6 text-center text-[13px] text-slate-400">
            Belum ada komponen. Klik "Tambah Komponen".
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(row, i) in rows"
              :key="i"
              class="grid grid-cols-1 items-start gap-2 rounded-lg border border-mahir-border p-2.5 sm:grid-cols-12"
            >
              <div class="sm:col-span-6">
                <SearchableSelect
                  v-model="row.componentTypeId"
                  :selected="row.selected"
                  :options="componentOptions"
                  :loading="componentLoading"
                  placeholder="Pilih komponen"
                  search-placeholder="Cari komponen…"
                  @search="setComponentSearch"
                />
              </div>
              <div class="sm:col-span-3">
                <input
                  v-model="row.value"
                  type="number"
                  step="0.01"
                  :class="fieldCls"
                  placeholder="Nilai"
                />
              </div>
              <div class="sm:col-span-2">
                <input v-model="row.notes" type="text" :class="fieldCls" placeholder="Catatan" />
              </div>
              <div class="flex justify-end sm:col-span-1">
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  title="Hapus baris"
                  @click="removeRow(i)"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-2 flex justify-end text-[13px] text-slate-500">
            Estimasi total komponen:
            <span class="ml-1 font-semibold text-slate-700">{{ money(estimatedTotal, form.currency) }}</span>
          </div>
        </div>

        <div>
          <label :class="labelCls">Catatan</label>
          <textarea v-model="form.notes" rows="2" :class="fieldCls" placeholder="Opsional"></textarea>
        </div>
      </div>
    </BaseModal>

    <!-- Konfirmasi hapus struktur gaji -->
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus Struktur Gaji"
      :message="deleteMessage"
      confirm-text="Ya, Hapus"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
