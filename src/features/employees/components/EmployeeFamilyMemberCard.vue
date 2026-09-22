<script setup>
// Tab "Keluarga" pada Detail Karyawan. Menampilkan anggota keluarga milik
// karyawan yang sedang dibuka (listEmployeeFamilyMember difilter employeeIds),
// plus aksi Tambah/Edit/Hapus. `isDependent` menandai tanggungan.
//
// Catatan: `gender` di backend bertipe String bebas; nilai MALE/FEMALE di bawah
// adalah asumsi — sesuaikan bila backend memakai kode lain.
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_EMPLOYEE_FAMILY_MEMBER,
  CREATE_EMPLOYEE_FAMILY_MEMBER,
  EDIT_EMPLOYEE_FAMILY_MEMBER,
  DELETE_EMPLOYEE_FAMILY_MEMBER,
} from "../graphql/familyMember.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { formatDate } from "@/shared/utils/format";
import { PERM } from "../permissions";
import {
  UsersIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  employee: { type: Object, default: null },
});

const auth = useAuthStore();
const toast = useToastStore();

const employeeId = computed(() => {
  const n = Number(props.employee?.id);
  return Number.isInteger(n) && n > 0 ? n : null;
});

// Jenis kelamin (String bebas di backend).
const GENDERS = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" },
];
function genderLabel(value) {
  if (!value) return "";
  return GENDERS.find((g) => g.value === value)?.label ?? value;
}

// ── Daftar anggota keluarga ──────────────────────────────────────────────────
const page = ref(1);
const pageSize = ref(10);

watch(employeeId, () => {
  page.value = 1;
});

const { result, loading, refetch } = useQuery(
  LIST_EMPLOYEE_FAMILY_MEMBER,
  () => ({
    params: {
      employeeIds: employeeId.value ? [employeeId.value] : null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listEmployeeFamilyMember?.data ?? null);
const members = computed(() => data.value?.results ?? []);
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

const canCreate = computed(() => auth.can(PERM.FAMILY_CREATE));
const canEdit = computed(() => auth.can(PERM.FAMILY_EDIT));
const canDelete = computed(() => auth.can(PERM.FAMILY_DELETE));

// ── Modal tambah / edit ──────────────────────────────────────────────────────
const modalOpen = ref(false);
const editingId = ref(null);
const isEdit = computed(() => editingId.value != null);

const blankForm = () => ({
  name: "",
  relationship: "",
  birthDate: "",
  gender: "",
  nik: "",
  occupation: "",
  isDependent: false,
});
const form = ref(blankForm());

function openCreate() {
  editingId.value = null;
  form.value = blankForm();
  modalOpen.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  form.value = {
    name: row.name ?? "",
    relationship: row.relationship ?? "",
    birthDate: row.birthDate ? String(row.birthDate).slice(0, 10) : "",
    gender: row.gender ?? "",
    nik: row.nik ?? "",
    occupation: row.occupation ?? "",
    isDependent: row.isDependent ?? false,
  };
  modalOpen.value = true;
}

watch(modalOpen, (open) => {
  if (!open) {
    editingId.value = null;
    form.value = blankForm();
  }
});

const { mutate: createMember, loading: creating } = useMutation(CREATE_EMPLOYEE_FAMILY_MEMBER);
const { mutate: editMember, loading: editingSave } = useMutation(EDIT_EMPLOYEE_FAMILY_MEMBER);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (isEdit.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const input = {
    employeeId: employeeId.value,
    name: f.name?.trim() || "",
    relationship: f.relationship?.trim() || "",
    birthDate: f.birthDate || null,
    gender: f.gender?.trim() || null,
    nik: f.nik?.trim() || null,
    occupation: f.occupation?.trim() || null,
    isDependent: !!f.isDependent,
  };

  try {
    if (isEdit.value) {
      const res = await editMember({ id: Number(editingId.value), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeFamilyMember?.data) throw new Error("Gagal menyimpan anggota keluarga");
    } else {
      const res = await createMember({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeFamilyMember?.data) throw new Error("Gagal menyimpan anggota keluarga");
    }
    toast.success("Anggota keluarga berhasil disimpan");
    modalOpen.value = false;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan anggota keluarga. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

// ── Hapus ────────────────────────────────────────────────────────────────────
const { mutate: deleteMemberMut, loading: deleting } = useMutation(DELETE_EMPLOYEE_FAMILY_MEMBER);
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus anggota keluarga "${deleteTarget.value?.name ?? ""}"? Tindakan ini tidak dapat dibatalkan.`,
);

function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  try {
    const res = await deleteMemberMut({ id: Number(deleteTarget.value.id), hard: false });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    toast.success("Anggota keluarga berhasil dihapus");
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menghapus anggota keluarga. Coba lagi.";
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
            <UsersIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Anggota Keluarga</h2>
            <p class="text-[11.5px] text-slate-400">{{ pagination.count }} anggota</p>
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
        <div v-if="loading && !members.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat data keluarga…
        </div>

        <!-- Kosong -->
        <div v-else-if="!members.length" class="py-12 text-center text-sm text-slate-400">
          Belum ada anggota keluarga untuk karyawan ini.
        </div>

        <!-- Daftar -->
        <div v-else class="space-y-3">
          <div
            v-for="m in members"
            :key="m.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-mahir-border px-4 py-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">{{ m.name }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{{ m.relationship }}</span>
                <span
                  v-if="m.isDependent"
                  class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600"
                >
                  Tanggungan
                </span>
              </div>
              <div class="mt-0.5 text-[12px] text-slate-400">
                <template v-if="m.gender">{{ genderLabel(m.gender) }}</template>
                <template v-if="m.birthDate"> · Lahir {{ formatDate(m.birthDate) }}</template>
                <template v-if="m.occupation"> · {{ m.occupation }}</template>
                <template v-if="m.nik"> · NIK {{ m.nik }}</template>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                v-if="canEdit"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="openEdit(m)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="openDelete(m)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / paginasi -->
      <div
        v-if="members.length"
        class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
      >
        <span class="text-[13px] text-mahir-muted"
          >Menampilkan {{ members.length }} dari {{ pagination.count }} anggota</span
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

    <!-- Modal tambah / edit anggota keluarga -->
    <BaseModal
      :open="modalOpen"
      :title="isEdit ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'"
      size="lg"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label :class="labelCls">Nama *</label>
          <input v-model="form.name" type="text" required :class="fieldCls" placeholder="Nama anggota keluarga" />
        </div>
        <div>
          <label :class="labelCls">Hubungan *</label>
          <input v-model="form.relationship" type="text" required :class="fieldCls" placeholder="mis. Anak, Istri, Suami" />
        </div>
        <div>
          <label :class="labelCls">Tanggal Lahir</label>
          <input v-model="form.birthDate" type="date" :class="fieldCls" />
        </div>
        <div>
          <label :class="labelCls">Jenis Kelamin</label>
          <select v-model="form.gender" :class="fieldCls">
            <option value="">—</option>
            <option v-for="g in GENDERS" :key="g.value" :value="g.value">{{ g.label }}</option>
          </select>
        </div>
        <div>
          <label :class="labelCls">NIK</label>
          <input v-model="form.nik" type="text" :class="fieldCls" placeholder="Opsional" />
        </div>
        <div>
          <label :class="labelCls">Pekerjaan</label>
          <input v-model="form.occupation" type="text" :class="fieldCls" placeholder="Opsional" />
        </div>
      </div>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
        <input v-model="form.isDependent" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">Tanggungan</span>
          <span class="block text-[12px] text-mahir-muted">Anggota keluarga yang menjadi tanggungan (memengaruhi PTKP pajak).</span>
        </span>
      </label>
    </BaseModal>

    <!-- Konfirmasi hapus -->
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus Anggota Keluarga"
      :message="deleteMessage"
      confirm-text="Ya, Hapus"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
