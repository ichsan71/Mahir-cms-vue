<script setup>
// Tab "Kontak Darurat" pada Detail Karyawan. Menampilkan kontak darurat milik
// karyawan yang sedang dibuka (listEmployeeEmergencyContact difilter employeeIds),
// plus aksi Tambah/Edit/Hapus. Satu karyawan boleh punya beberapa kontak;
// salah satunya bisa ditandai utama (isPrimary).
import { computed, ref, watch } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  LIST_EMPLOYEE_EMERGENCY_CONTACT,
  CREATE_EMPLOYEE_EMERGENCY_CONTACT,
  EDIT_EMPLOYEE_EMERGENCY_CONTACT,
  DELETE_EMPLOYEE_EMERGENCY_CONTACT,
} from "../graphql/emergencyContact.queries";
import BaseModal from "@/shared/components/BaseModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { PERM } from "../permissions";
import {
  LifebuoyIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
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

// ── Daftar kontak darurat ────────────────────────────────────────────────────
const page = ref(1);
const pageSize = ref(10);

watch(employeeId, () => {
  page.value = 1;
});

const { result, loading, refetch } = useQuery(
  LIST_EMPLOYEE_EMERGENCY_CONTACT,
  () => ({
    params: {
      employeeIds: employeeId.value ? [employeeId.value] : null,
      page: page.value || null,
      pageSize: pageSize.value || null,
    },
  }),
  () => ({ enabled: !!employeeId.value, fetchPolicy: "cache-and-network" }),
);

const data = computed(() => result.value?.listEmployeeEmergencyContact?.data ?? null);
const contacts = computed(() => data.value?.results ?? []);
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

const canCreate = computed(() => auth.can(PERM.EMERGENCY_CREATE));
const canEdit = computed(() => auth.can(PERM.EMERGENCY_EDIT));
const canDelete = computed(() => auth.can(PERM.EMERGENCY_DELETE));

// ── Modal tambah / edit ──────────────────────────────────────────────────────
const modalOpen = ref(false);
const editingId = ref(null);
const isEdit = computed(() => editingId.value != null);

const blankForm = () => ({
  name: "",
  relationship: "",
  phone: "",
  alternatePhone: "",
  address: "",
  isPrimary: false,
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
    phone: row.phone ?? "",
    alternatePhone: row.alternatePhone ?? "",
    address: row.address ?? "",
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

const { mutate: createContact, loading: creating } = useMutation(CREATE_EMPLOYEE_EMERGENCY_CONTACT);
const { mutate: editContact, loading: editingSave } = useMutation(EDIT_EMPLOYEE_EMERGENCY_CONTACT);
const saving = computed(() => creating.value || editingSave.value);

async function save() {
  if (!employeeId.value) return;
  if (isEdit.value ? !canEdit.value : !canCreate.value) return;

  const f = form.value;
  const input = {
    employeeId: employeeId.value,
    name: f.name?.trim() || "",
    relationship: f.relationship?.trim() || "",
    phone: f.phone?.trim() || "",
    alternatePhone: f.alternatePhone?.trim() || null,
    address: f.address?.trim() || null,
    isPrimary: !!f.isPrimary,
  };

  try {
    if (isEdit.value) {
      const res = await editContact({ id: Number(editingId.value), input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.editEmployeeEmergencyContact?.data) throw new Error("Gagal menyimpan kontak");
    } else {
      const res = await createContact({ input });
      if (res?.errors?.length) throw new Error(res.errors[0].message);
      if (!res?.data?.createEmployeeEmergencyContact?.data) throw new Error("Gagal menyimpan kontak");
    }
    toast.success("Kontak darurat berhasil disimpan");
    modalOpen.value = false;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menyimpan kontak. Coba lagi.";
    toast.error(msg.replace(/^GraphQL error:\s*/i, "").trim());
  }
}

// ── Hapus ────────────────────────────────────────────────────────────────────
const { mutate: deleteContactMut, loading: deleting } = useMutation(DELETE_EMPLOYEE_EMERGENCY_CONTACT);
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus kontak darurat "${deleteTarget.value?.name ?? ""}"? Tindakan ini tidak dapat dibatalkan.`,
);

function openDelete(row) {
  deleteTarget.value = row;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  try {
    const res = await deleteContactMut({ id: Number(deleteTarget.value.id), hard: false });
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    toast.success("Kontak darurat berhasil dihapus");
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  } catch (e) {
    const msg =
      e?.graphQLErrors?.[0]?.message ||
      e?.networkError?.message ||
      e?.message ||
      "Gagal menghapus kontak. Coba lagi.";
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
            <LifebuoyIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-semibold text-slate-900">Kontak Darurat</h2>
            <p class="text-[11.5px] text-slate-400">{{ pagination.count }} kontak</p>
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
        <div v-if="loading && !contacts.length" class="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <ArrowPathIcon class="h-4 w-4 animate-spin" /> Memuat kontak…
        </div>

        <!-- Kosong -->
        <div v-else-if="!contacts.length" class="py-12 text-center text-sm text-slate-400">
          Belum ada kontak darurat untuk karyawan ini.
        </div>

        <!-- Daftar kontak -->
        <div v-else class="space-y-3">
          <div
            v-for="c in contacts"
            :key="c.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-mahir-border px-4 py-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">{{ c.name }}</span>
                <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{{ c.relationship }}</span>
                <span
                  v-if="c.isPrimary"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600"
                >
                  <StarIcon class="h-3 w-3" /> Utama
                </span>
              </div>
              <div class="mt-0.5 text-[13px] text-slate-600">
                {{ c.phone }}
                <template v-if="c.alternatePhone"> · {{ c.alternatePhone }}</template>
              </div>
              <div v-if="c.address" class="mt-0.5 text-[12px] text-slate-400">{{ c.address }}</div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                v-if="canEdit"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Edit"
                @click="openEdit(c)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                v-if="canDelete"
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                title="Hapus"
                @click="openDelete(c)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / paginasi -->
      <div
        v-if="contacts.length"
        class="flex items-center justify-between border-t border-mahir-border px-5 py-3"
      >
        <span class="text-[13px] text-mahir-muted"
          >Menampilkan {{ contacts.length }} dari {{ pagination.count }} kontak</span
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

    <!-- Modal tambah / edit kontak -->
    <BaseModal
      :open="modalOpen"
      :title="isEdit ? 'Edit Kontak Darurat' : 'Tambah Kontak Darurat'"
      size="lg"
      :loading="saving"
      @update:open="modalOpen = $event"
      @submit="save"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label :class="labelCls">Nama *</label>
          <input v-model="form.name" type="text" required :class="fieldCls" placeholder="Nama kontak" />
        </div>
        <div>
          <label :class="labelCls">Hubungan *</label>
          <input v-model="form.relationship" type="text" required :class="fieldCls" placeholder="mis. Orang Tua, Pasangan" />
        </div>
        <div>
          <label :class="labelCls">Nomor Telepon *</label>
          <input v-model="form.phone" type="text" required :class="fieldCls" placeholder="Nomor utama" />
        </div>
        <div>
          <label :class="labelCls">Telepon Alternatif</label>
          <input v-model="form.alternatePhone" type="text" :class="fieldCls" placeholder="Opsional" />
        </div>
        <div class="md:col-span-2">
          <label :class="labelCls">Alamat</label>
          <textarea v-model="form.address" rows="2" :class="fieldCls" placeholder="Opsional"></textarea>
        </div>
      </div>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
        <input v-model="form.isPrimary" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
        <span>
          <span class="block text-sm font-medium text-slate-700">Kontak utama</span>
          <span class="block text-[12px] text-mahir-muted">Kontak yang dihubungi pertama kali dalam keadaan darurat.</span>
        </span>
      </label>
    </BaseModal>

    <!-- Konfirmasi hapus -->
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus Kontak Darurat"
      :message="deleteMessage"
      confirm-text="Ya, Hapus"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
