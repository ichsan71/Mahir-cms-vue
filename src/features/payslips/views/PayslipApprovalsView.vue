<script setup>
// Tab "Persetujuan" — inbox persetujuan slip gaji (baris PayslipApproval).
// Approver menyetujui/menolak satuan atau massal. Semua aksi di-gate permission.
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { usePayslipApprovals } from "../composables/usePayslipApprovals";
import { usePayslipApprovalActions } from "../composables/usePayslipApprovalActions";
import { usePayslipApprovalFiltersStore } from "../stores/payslipApprovalFilters.store";
import { statusMeta, isPendingApproval, PAGE_SIZES } from "../constants";
import { PERM } from "../permissions";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useEmployeeSearch } from "@/features/employees/composables/useEmployeeSearch";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import PayslipDetailModal from "../components/PayslipDetailModal.vue";
import { formatDate } from "@/shared/utils/format";
import { EyeIcon, CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const filters = usePayslipApprovalFiltersStore();
const { employeeIds: filterEmployeeIds } = storeToRefs(filters);

const { approvals, pagination, loading, refetch, nextPage, prevPage } = usePayslipApprovals();
const { approve, reject, approveMany, rejectMany, loading: acting } = usePayslipApprovalActions();

const {
  options: employeeOptions,
  loading: employeeLoading,
  setSearch: setEmployeeSearch,
} = useEmployeeSearch();
const employeeSelected = ref([]);

// Opsi status filter baris approval slip gaji — grup khusus PAYSLIP_APPROVAL_STATUS.
// Nilai yang dikirim = enum LeaveApprovalStatusChoices (WAITING/PENDING/APPROVED/
// REJECTED), sesuai tipe param `status` di schema.
const { options: statusOptions } = useEnumChoices("PAYSLIP_APPROVAL_STATUS");

function money(v, currency) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  const num = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.trunc(n));
  return `${currency || "IDR"} ${num}`;
}

// Gabungkan nama unit (relasi many) menjadi satu teks.
function unitNames(emp) {
  return (emp?.units ?? []).map((u) => u.name).join(", ") || "—";
}

const canAct = computed(() => auth.can(PERM.APPROVE) || auth.can(PERM.REJECT));

// ── Seleksi massal (hanya baris yang masih menunggu) ────────────────────────
const selected = ref(new Set());
const pendingRows = computed(() => approvals.value.filter((a) => isPendingApproval(a.status)));
function toggle(id) {
  const s = new Set(selected.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selected.value = s;
}
const allSelected = computed(
  () => pendingRows.value.length > 0 && pendingRows.value.every((a) => selected.value.has(a.id)),
);
function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(pendingRows.value.map((a) => a.id));
}
const selectedCount = computed(() => selected.value.size);

// ── Detail slip ──────────────────────────────────────────────────────────────
const detailOpen = ref(false);
const detailId = ref(null);
function openDetail(row) {
  detailId.value = row.payslip?.id ?? null;
  if (detailId.value) detailOpen.value = true;
}

// ── Konfirmasi approve/reject (satuan & massal) ──────────────────────────────
const confirmOpen = ref(false);
const confirmAction = ref("approve"); // "approve" | "reject"
const confirmBulk = ref(false);
const confirmTarget = ref(null);

const isApprove = computed(() => confirmAction.value === "approve");
const confirmMeta = computed(() => {
  const verb = isApprove.value ? "menyetujui" : "menolak";
  if (confirmBulk.value) {
    return {
      title: isApprove.value ? "Setujui Terpilih" : "Tolak Terpilih",
      message: `Yakin ${verb} ${selectedCount.value} slip gaji terpilih?`,
      confirm: isApprove.value ? "Ya, Setujui" : "Ya, Tolak",
    };
  }
  const name = confirmTarget.value?.payslip?.employee?.fullName ?? "";
  return {
    title: isApprove.value ? "Setujui Slip" : "Tolak Slip",
    message: `Yakin ${verb} slip gaji ${name ? `"${name}"` : "ini"}?`,
    confirm: isApprove.value ? "Ya, Setujui" : "Ya, Tolak",
  };
});

function openApprove(row) {
  confirmAction.value = "approve";
  confirmBulk.value = false;
  confirmTarget.value = row;
  confirmOpen.value = true;
}
function openReject(row) {
  confirmAction.value = "reject";
  confirmBulk.value = false;
  confirmTarget.value = row;
  confirmOpen.value = true;
}
function openBulk(action) {
  confirmAction.value = action;
  confirmBulk.value = true;
  confirmTarget.value = null;
  confirmOpen.value = true;
}

async function handleConfirm() {
  let ok = false;
  if (confirmBulk.value) {
    const ids = [...selected.value];
    const res = isApprove.value ? await approveMany(ids) : await rejectMany(ids);
    ok = !!res;
    if (ok) selected.value = new Set();
  } else {
    const id = confirmTarget.value?.id;
    ok = isApprove.value ? await approve(id) : await reject(id);
  }
  if (ok) {
    confirmOpen.value = false;
    confirmTarget.value = null;
    refetch();
  }
}

const fieldCls =
  "rounded-lg border border-mahir-border py-2 px-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Persetujuan Slip Gaji
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <div class="min-w-[220px]">
          <SearchableSelect
            v-model="filterEmployeeIds"
            :selected="employeeSelected"
            :options="employeeOptions"
            :loading="employeeLoading"
            multiple
            floating
            placeholder="Semua karyawan"
            search-placeholder="Cari karyawan…"
            @search="setEmployeeSearch"
          />
        </div>
        <select v-model="filters.status" :class="fieldCls">
          <option value="">Semua Status</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Bar aksi massal -->
    <div
      v-if="canAct && selectedCount"
      class="flex items-center justify-between gap-3 border-y border-mahir-border bg-mahir-primary/5 px-5 py-2.5"
    >
      <span class="text-[13px] font-medium text-slate-700">{{ selectedCount }} slip terpilih</span>
      <div class="flex items-center gap-2">
        <button
          v-if="auth.can(PERM.APPROVE_MANY)"
          class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-mahir-primary/90"
          @click="openBulk('approve')"
        >
          <CheckIcon class="h-4 w-4" /> Setujui
        </button>
        <button
          v-if="auth.can(PERM.REJECT_MANY)"
          class="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
          @click="openBulk('reject')"
        >
          <XMarkIcon class="h-4 w-4" /> Tolak
        </button>
      </div>
    </div>

    <!-- Bar: jumlah per halaman + info jumlah data -->
    <div class="flex items-center gap-3 border-t border-mahir-border px-5 py-2.5">
      <label class="flex items-center gap-1.5 text-[13px] text-mahir-muted">
        Tampilkan
        <select v-model.number="filters.pageSize" :class="fieldCls" class="!py-1">
          <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ approvals.length }} dari {{ pagination.count }} baris</span
      >
    </div>

    <!-- Tabel -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
            <th v-if="canAct" class="px-4 py-3">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            </th>
            <th class="px-4 py-3 font-semibold">Karyawan</th>
            <th class="px-4 py-3 font-semibold">Unit</th>
            <th class="px-4 py-3 font-semibold">Level</th>
            <th class="px-4 py-3 font-semibold">Periode</th>
            <th class="px-4 py-3 text-right font-semibold">Gaji Bersih</th>
            <th class="px-4 py-3 font-semibold">Approver</th>
            <th class="px-4 py-3 text-center font-semibold">Status</th>
            <th class="px-4 py-3 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !approvals.length">
            <td :colspan="canAct ? 9 : 8" class="px-4 py-8 text-center text-slate-400">Memuat data…</td>
          </tr>
          <tr v-else-if="!approvals.length">
            <td :colspan="canAct ? 9 : 8" class="px-4 py-8 text-center text-slate-400">
              Tidak ada slip yang menunggu persetujuan.
            </td>
          </tr>
          <tr
            v-for="row in approvals"
            :key="row.id"
            class="border-b border-mahir-border last:border-0 hover:bg-slate-50/60"
          >
            <td v-if="canAct" class="px-4 py-3">
              <input
                v-if="isPendingApproval(row.status)"
                type="checkbox"
                :checked="selected.has(row.id)"
                @change="toggle(row.id)"
              />
            </td>
            <td class="px-4 py-3 font-semibold text-slate-800">
              {{ row.payslip?.employee?.fullName ?? "-" }}
            </td>
            <td class="px-4 py-3 text-slate-600">{{ unitNames(row.payslip?.employee) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ row.payslip?.employee?.level?.name ?? "—" }}</td>
            <td class="px-4 py-3 text-slate-600">
              {{ formatDate(row.payslip?.periodStart) }} – {{ formatDate(row.payslip?.periodEnd) }}
            </td>
            <td class="px-4 py-3 text-right font-bold text-slate-800">
              {{ money(row.payslip?.netPay, row.payslip?.currency) }}
            </td>
            <td class="px-4 py-3 text-slate-600">{{ row.approver?.fullName ?? "-" }}</td>
            <td class="px-4 py-3 text-center">
              <span
                class="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                :class="statusMeta(row.status).cls"
              >
                {{ statusMeta(row.status).label }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  v-if="auth.can(PERM.GET) && row.payslip?.id"
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Detail"
                  @click="openDetail(row)"
                >
                  <EyeIcon class="h-4 w-4" />
                </button>
                <template v-if="isPendingApproval(row.status)">
                  <button
                    v-if="auth.can(PERM.APPROVE)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    title="Setujui"
                    @click="openApprove(row)"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="auth.can(PERM.REJECT)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    title="Tolak"
                    @click="openReject(row)"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / pagination -->
    <div class="flex items-center justify-end border-t border-mahir-border px-5 py-3">
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

  <PayslipDetailModal v-model:open="detailOpen" :payslip-id="detailId" />

  <ConfirmDialog
    v-model:open="confirmOpen"
    :title="confirmMeta.title"
    :message="confirmMeta.message"
    :confirm-text="confirmMeta.confirm"
    :variant="isApprove ? 'primary' : 'danger'"
    :loading="acting"
    @confirm="handleConfirm"
  />
</template>
