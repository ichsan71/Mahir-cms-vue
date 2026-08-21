<script setup>
// Tab "Saldo Cuti" pada Detail Karyawan. Menampilkan saldo cuti milik karyawan
// yang sedang dibuka (listLeaveBalance difilter employeeId) dan menyediakan aksi
// Edit per baris → modal editLeaveBalance. employeeId otomatis dari karyawan ini,
// tipe cuti dipilih lewat SearchableSelect (listLeaveType).
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_EMPLOYEE_LEAVE_BALANCE,
  LIST_EMPLOYEE_LEAVE_BALANCE_YEARS,
  CREATE_LEAVE_BALANCE,
  EDIT_LEAVE_BALANCE,
} from "../graphql/leaveBalance.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useLeaveTypeSearch } from "@/features/leaveTypes/composables/useLeaveTypeSearch";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { PERM } from "../permissions";
import { CalendarDaysIcon, ArrowPathIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — saldonya diambil via employeeId.
  employee: { type: Object, default: null },
});

const auth = useAuthStore();
const toast = useToastStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

// ── Filter & paginasi ───────────────────────────────────────────────────────
const year = ref(""); // "" = semua tahun
const page = ref(1);
const pageSize = ref(10);

// Pilihan tahun diambil dari data saldo karyawan (bukan hardcode): ambil semua
// saldo (tanpa filter tahun), lalu distinct & urut menurun.
const { result: yearsResult, refetch: refetchYears } = useQuery(
  LIST_EMPLOYEE_LEAVE_BALANCE_YEARS,
  () => ({ params: { employeeId: employeeId.value, page: 1, pageSize: 1000 } }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const yearOptions = computed(() => {
  const years = (yearsResult.value?.listLeaveBalance?.data?.results ?? [])
    .map((r) => Number(r.year))
    .filter((y) => Number.isInteger(y));
  return [...new Set(years)].sort((a, b) => b - a);
});

// Ganti filter → kembali ke halaman 1. Ganti karyawan → reset juga.
watch([year, employeeId], () => {
  page.value = 1;
});

// Daftar saldo cuti karyawan ini, difilter employeeId (+ year) & paginated.
const { result, loading, refetch } = useQuery(
  LIST_EMPLOYEE_LEAVE_BALANCE,
  () => ({
    params: {
      employeeId: employeeId.value,
      year: year.value ? Number(year.value) : null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listLeaveBalance?.data ?? null);
const balances = computed(() => data.value?.results ?? []);
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

const canCreate = computed(() => auth.can(PERM.BALANCE_CREATE));
const canEdit = computed(() => auth.can(PERM.BALANCE_EDIT));

// ── Modal tambah / edit ─────────────────────────────────────────────────────
const { options: leaveTypeOptions, loading: leaveTypeLoading, setSearch: setLeaveTypeSearch } =
  useLeaveTypeSearch();

const modalOpen = ref(false);
const editingId = ref(null); // null = mode tambah
const isEdit = computed(() => editingId.value != null);
const leaveTypeSelected = ref(null);

const blank = () => ({ leaveTypeId: "", year: "", allocated: "", used: "" });
const form = ref(blank());

function toNumStr(v) {
  return v === null || v === undefined ? "" : String(v);
}

function openCreate() {
  editingId.value = null;
  form.value = blank();
  leaveTypeSelected.value = null;
  modalOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  form.value = {
    leaveTypeId: row.leaveType?.id ?? "",
    year: toNumStr(row.year),
    allocated: toNumStr(row.allocated),
    used: toNumStr(row.used),
  };
  leaveTypeSelected.value = row.leaveType ?? null;
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) {
    editingId.value = null;
    form.value = blank();
    leaveTypeSelected.value = null;
  }
});

function toInt(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}
function toFloat(v) {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const { mutate: createLeaveBalance, loading: creating } = useMutation(CREATE_LEAVE_BALANCE);
const { mutate: editLeaveBalance, loading: editingSave } = useMutation(EDIT_LEAVE_BALANCE);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  // Gate sesuai mode: tambah butuh createLeaveBalance, edit butuh editLeaveBalance.
  if (isEdit.value ? !canEdit.value : !canCreate.value) return;
  const f = form.value;
  const input = {
    employeeId: employeeId.value,
    leaveTypeId: toInt(f.leaveTypeId),
    year: toInt(f.year),
    allocated: toFloat(f.allocated),
    used: toFloat(f.used),
  };
  try {
    if (isEdit.value) {
      const res = await editLeaveBalance({ editLeaveBalanceId: Number(editingId.value), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editLeaveBalance?.data) throw new Error("Gagal menyimpan saldo cuti");
    } else {
      const res = await createLeaveBalance({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createLeaveBalance?.data) throw new Error("Gagal menyimpan saldo cuti");
    }
    toast.success("Saldo cuti berhasil disimpan");
    modalOpen.value = false;
    refetch();
    refetchYears();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan saldo cuti. Coba lagi.";
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
          <CalendarDaysIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="font-semibold text-slate-900">Saldo Cuti</h2>
          <p class="text-[11.5px] text-slate-400">
            {{ pagination.count }} saldo
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Filter tahun -->
        <select
          v-model="year"
          class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
        >
          <option value="">Semua Tahun</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>

        <!-- Tambah saldo -->
        <button
          v-if="canCreate"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-mahir-primary/90"
          @click="openCreate"
        >
          <PlusIcon class="h-4 w-4" /> Tambah
        </button>
      </div>
    </div>

    <div class="p-5">
      <!-- Loading -->
      <div v-if="loading && !balances.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
        <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat saldo cuti…
      </div>

      <!-- Kosong -->
      <div v-else-if="!balances.length" class="py-12 text-center text-sm text-slate-400">
        Belum ada saldo cuti untuk karyawan ini.
      </div>

      <!-- Tabel saldo -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-mahir-border text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th class="py-2.5 pr-4 font-semibold">Tipe Cuti</th>
              <th class="py-2.5 pr-4 font-semibold">Tahun</th>
              <th class="py-2.5 pr-4 font-semibold text-right">Kuota</th>
              <th class="py-2.5 pr-4 font-semibold text-right">Terpakai</th>
              <th class="py-2.5 pr-4 font-semibold text-right">Sisa</th>
              <th v-if="canEdit" class="py-2.5 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in balances"
              :key="b.id"
              class="border-b border-mahir-border/60 last:border-0"
            >
              <td class="py-3 pr-4 font-medium text-slate-800">{{ b.leaveType?.name ?? "-" }}</td>
              <td class="py-3 pr-4 text-slate-600">{{ b.year }}</td>
              <td class="py-3 pr-4 text-right text-slate-600">{{ b.allocated }}</td>
              <td class="py-3 pr-4 text-right text-slate-600">{{ b.used }}</td>
              <td class="py-3 pr-4 text-right font-semibold text-slate-800">{{ b.remaining }}</td>
              <td v-if="canEdit" class="py-3 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-1.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  @click="openEdit(b)"
                >
                  <PencilSquareIcon class="h-4 w-4" /> Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer / paginasi -->
    <div
      v-if="balances.length"
      class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
    >
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ balances.length }} dari {{ pagination.count }} saldo</span
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

  <!-- Modal edit saldo cuti -->
  <BaseModal
    :open="modalOpen"
    :title="isEdit ? 'Edit Saldo Cuti' : 'Tambah Saldo Cuti'"
    size="md"
    :loading="saving"
    @update:open="modalOpen = $event"
    @submit="save"
  >
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
      <div class="md:col-span-2">
        <label :class="labelCls">Tipe Cuti *</label>
        <SearchableSelect
          v-model="form.leaveTypeId"
          :selected="leaveTypeSelected"
          :options="leaveTypeOptions"
          :loading="leaveTypeLoading"
          placeholder="Pilih tipe cuti"
          search-placeholder="Cari tipe cuti…"
          @search="setLeaveTypeSearch"
        />
      </div>
      <div>
        <label :class="labelCls">Tahun *</label>
        <input v-model="form.year" type="number" min="0" :class="fieldCls" placeholder="mis. 2026" />
      </div>
      <div>
        <label :class="labelCls">Kuota (hari)</label>
        <input v-model="form.allocated" type="number" min="0" step="0.5" :class="fieldCls" placeholder="mis. 12" />
      </div>
      <div>
        <label :class="labelCls">Terpakai (hari)</label>
        <input v-model="form.used" type="number" min="0" step="0.5" :class="fieldCls" placeholder="0" />
      </div>
    </div>
  </BaseModal>
  </div>
</template>
