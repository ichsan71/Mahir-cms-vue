<script setup>
// Tab "Rekening Bank" pada Detail Karyawan. Menampilkan rekening bank milik
// karyawan yang sedang dibuka (listEmployeeBankAccount difilter employeeIds),
// plus aksi Tambah/Edit/Hapus. Satu karyawan boleh punya banyak rekening;
// salah satunya bisa ditandai sebagai rekening utama (isPrimary).
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_EMPLOYEE_BANK_ACCOUNT,
  CREATE_EMPLOYEE_BANK_ACCOUNT,
  EDIT_EMPLOYEE_BANK_ACCOUNT,
  DELETE_EMPLOYEE_BANK_ACCOUNT,
} from "../graphql/bankAccount.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { PERM } from "../permissions";
import {
  BuildingLibraryIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // Karyawan yang sedang dibuka — rekeningnya diambil via employeeId.
  employee: { type: Object, default: null },
});

const auth = useAuthStore();
const toast = useToastStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

// ── Daftar rekening karyawan ini ─────────────────────────────────────────────
const page = ref(1);
const pageSize = ref(10);

watch(employeeId, () => {
  page.value = 1;
});

const { result, loading, refetch } = useQuery(
  LIST_EMPLOYEE_BANK_ACCOUNT,
  () => ({
    params: {
      employeeIds: employeeId.value ? [employeeId.value] : null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listEmployeeBankAccount?.data ?? null);
const accounts = computed(() => data.value?.results ?? []);
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

const canCreate = computed(() => auth.can(PERM.BANK_CREATE));
const canEdit = computed(() => auth.can(PERM.BANK_EDIT));
const canDelete = computed(() => auth.can(PERM.BANK_DELETE));

// ── Modal tambah / edit ──────────────────────────────────────────────────────
const modalOpen = ref(false);
const editingId = ref(null); // null = mode tambah
const isEdit = computed(() => editingId.value != null);

const blankForm = () => ({
  bankName: "",
  bankCode: "",
  accountNumber: "",
  accountHolderName: "",
  branchName: "",
  isPrimary: false,
});
const form = ref(blankForm());

function openCreate() {
  editingId.value = null;
  form.value = blankForm();
  // Prefill nama pemilik dengan nama karyawan sebagai kemudahan.
  form.value.accountHolderName = props.employee?.fullName ?? "";
  modalOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  form.value = {
    bankName: row.bankName ?? "",
    bankCode: row.bankCode ?? "",
    accountNumber: row.accountNumber ?? "",
    accountHolderName: row.accountHolderName ?? "",
    branchName: row.branchName ?? "",
    isPrimary: row.isPrimary ?? false,
  };
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) {
    editingId.value = null;
    form.value = blankForm();
  }
});

const { mutate: createAccount, loading: creating } = useMutation(CREATE_EMPLOYEE_BANK_ACCOUNT);
const { mutate: editAccount, loading: editingSave } = useMutation(EDIT_EMPLOYEE_BANK_ACCOUNT);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (isEdit.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const input = {
    employeeId: employeeId.value,
    bankName: f.bankName?.trim() || "",
    accountNumber: f.accountNumber?.trim() || "",
    accountHolderName: f.accountHolderName?.trim() || "",
    bankCode: f.bankCode?.trim() || null,
    branchName: f.branchName?.trim() || null,
    isPrimary: !!f.isPrimary,
  };

  try {
    if (isEdit.value) {
      const res = await editAccount({ id: Number(editingId.value), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeBankAccount?.data) throw new Error("Gagal menyimpan rekening");
    } else {
      const res = await createAccount({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeBankAccount?.data) throw new Error("Gagal menyimpan rekening");
    }
    toast.success("Rekening bank berhasil disimpan");
    modalOpen.value = false;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan rekening. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

// ── Hapus ────────────────────────────────────────────────────────────────────
const { mutate: deleteAccountMut, loading: deleting } = useMutation(DELETE_EMPLOYEE_BANK_ACCOUNT);
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () =>
    `Hapus rekening ${deleteTarget.value?.bankName ?? ""} a.n. ${deleteTarget.value?.accountHolderName ?? ""}? Tindakan ini tidak dapat dibatalkan.`,
);

function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  try {
    const res = await deleteAccountMut({ id: Number(deleteTarget.value.id), hard: false });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    toast.success("Rekening bank berhasil dihapus");
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menghapus rekening. Coba lagi.";
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
            <BuildingLibraryIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Rekening Bank</h2>
            <p class="text-[11.5px] text-slate-400">{{ pagination.count }} rekening</p>
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
        <div v-if="loading && !accounts.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat rekening…
        </div>

        <!-- Kosong -->
        <div v-else-if="!accounts.length" class="py-12 text-center text-sm text-slate-400">
          Belum ada rekening bank untuk karyawan ini.
        </div>

        <!-- Daftar rekening -->
        <div v-else class="space-y-3">
          <div
            v-for="a in accounts"
            :key="a.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-mahir-border px-4 py-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">{{ a.bankName }}</span>
                <span
                  v-if="a.isPrimary"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600"
                >
                  <StarIcon class="h-3 w-3" /> Utama
                </span>
              </div>
              <div class="mt-0.5 font-mono text-[13px] text-slate-600">{{ a.accountNumber }}</div>
              <div class="mt-0.5 text-[12px] text-slate-400">
                a.n. {{ a.accountHolderName }}
                <template v-if="a.branchName"> · Cabang {{ a.branchName }}</template>
                <template v-if="a.bankCode"> · Kode {{ a.bankCode }}</template>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                v-if="canEdit"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="openEdit(a)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="openDelete(a)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / paginasi -->
      <div
        v-if="accounts.length"
        class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
      >
        <span class="text-[13px] text-mahir-muted"
          >Menampilkan {{ accounts.length }} dari {{ pagination.count }} rekening</span
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

    <!-- Modal tambah / edit rekening -->
    <BaseModal
      :open="modalOpen"
      :title="isEdit ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'"
      size="lg"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label :class="labelCls">Nama Bank *</label>
          <input v-model="form.bankName" type="text" required :class="fieldCls" placeholder="mis. Bank Mandiri" />
        </div>
        <div>
          <label :class="labelCls">Kode Bank</label>
          <input v-model="form.bankCode" type="text" :class="fieldCls" placeholder="mis. 008" />
        </div>
        <div>
          <label :class="labelCls">Nomor Rekening *</label>
          <input v-model="form.accountNumber" type="text" required :class="fieldCls" placeholder="Nomor rekening" />
        </div>
        <div>
          <label :class="labelCls">Nama Pemilik *</label>
          <input v-model="form.accountHolderName" type="text" required :class="fieldCls" placeholder="Nama sesuai buku tabungan" />
        </div>
        <div class="md:col-span-2">
          <label :class="labelCls">Cabang</label>
          <input v-model="form.branchName" type="text" :class="fieldCls" placeholder="mis. KCP Sudirman" />
        </div>
      </div>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
        <input v-model="form.isPrimary" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">Rekening utama</span>
          <span class="block text-[12px] text-mahir-muted">Rekening yang dipakai sebagai tujuan transfer gaji.</span>
        </span>
      </label>
    </BaseModal>

    <!-- Konfirmasi hapus rekening -->
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus Rekening Bank"
      :message="deleteMessage"
      confirm-text="Ya, Hapus"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
