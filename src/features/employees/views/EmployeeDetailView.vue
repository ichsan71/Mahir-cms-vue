<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployeeDetail } from "../composables/useEmployeeDetail";
import { useEmployeeAddresses } from "../composables/useEmployeeAddresses";
import EmployeeIdentityHeader from "../components/EmployeeIdentityHeader.vue";
import EmployeeProfileCard from "../components/EmployeeProfileCard.vue";
import EmployeeAccessCard from "../components/EmployeeAccessCard.vue";
import EmployeeLeaveBalanceCard from "../components/EmployeeLeaveBalanceCard.vue";
import EmployeeAddressModal from "../components/EmployeeAddressModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { ArrowLeftIcon, ArrowPathIcon, UserMinusIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = computed(() => route.params.id);
const { employee, loading, refetch } = useEmployeeDetail(id);

// Tab detail: profil vs hak akses. Tab "Hak Akses" hanya muncul bila user boleh
// melihat katalog group (listGroup).
const canViewAccess = computed(() => auth.can(PERM.GROUP_LIST));
// Tab "Saldo Cuti" hanya muncul bila user boleh melihat saldo cuti (listLeaveBalance).
const canViewBalance = computed(() => auth.can(PERM.BALANCE_LIST));
const tabs = computed(() => [
  { id: "profil", label: "Profil" },
  ...(canViewAccess.value ? [{ id: "akses", label: "Hak Akses" }] : []),
  ...(canViewBalance.value ? [{ id: "saldo-cuti", label: "Saldo Cuti" }] : []),
]);
const tab = ref("profil");

function goBack() {
  router.push({ name: "karyawan" });
}

// ── Kelola alamat karyawan (CRUD, ditampilkan di kartu profil) ──────────────
const { createAddress, editAddress, deleteAddress, loading: savingAddress } = useEmployeeAddresses();

// NIK adalah data konfidensial: tidak pernah ditampilkan di detail karyawan lain.
// (NIK milik sendiri tetap tampil di "Profil Saya" via default showNik.)
const canViewNik = false;

const canAddAddress = computed(() => auth.can(PERM.ADDRESS_CREATE));
const canEditAddress = computed(() => auth.can(PERM.ADDRESS_EDIT));
const canDeleteAddress = computed(() => auth.can(PERM.ADDRESS_DELETE));
const editableAddress = computed(
  () => canAddAddress.value || canEditAddress.value || canDeleteAddress.value,
);

const addressModalOpen = ref(false);
const editingAddress = ref(null);

function openAddAddress() {
  editingAddress.value = null;
  addressModalOpen.value = true;
}

function openEditAddress(addr) {
  editingAddress.value = addr;
  addressModalOpen.value = true;
}

async function handleSaveAddress({ id: addressId, input }) {
  const ok = addressId ? await editAddress(addressId, input) : await createAddress(input);
  if (ok) {
    addressModalOpen.value = false;
    refetch();
  }
}

// Hapus alamat: konfirmasi dulu.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () => `Hapus alamat "${deleteTarget.value?.line1 ?? ''}"? Tindakan ini tidak dapat dibatalkan.`,
);

function openDeleteAddress(addr) {
  deleteTarget.value = addr;
  confirmOpen.value = true;
}

async function handleDeleteAddress() {
  if (!deleteTarget.value) return;
  const ok = await deleteAddress(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <div class="mb-5 flex items-center justify-between">
    <button
      class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mahir-muted hover:text-slate-900 transition-colors"
      @click="goBack"
    >
      <ArrowLeftIcon class="h-4 w-4" /> Kembali
    </button>
  </div>

  <div v-if="loading && !employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <ArrowPathIcon class="h-7 w-7 animate-spin text-mahir-primary mb-3" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data karyawan...</p>
  </div>

  <div v-else-if="!employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <UserMinusIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data karyawan tidak ditemukan</p>
    <p class="text-xs text-slate-400 mt-1">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <!-- Header identitas persisten: tetap tampil di semua tab -->
    <EmployeeIdentityHeader :employee="employee" :show-nik="canViewNik" class="mb-5" />

    <!-- Tab: Profil / Hak Akses / Saldo Cuti -->
    <div class="mb-5 flex gap-1 border-b border-mahir-border">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors"
        :class="tab === t.id
          ? 'border-mahir-primary text-mahir-primary'
          : 'border-transparent text-slate-500 hover:text-slate-800'"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <EmployeeProfileCard
      v-show="tab === 'profil'"
      :employee="employee"
      :show-nik="canViewNik"
      :show-identity="false"
      :editable-address="editableAddress"
      :can-add-address="canAddAddress"
      :can-edit-address="canEditAddress"
      :can-delete-address="canDeleteAddress"
      @add-address="openAddAddress"
      @edit-address="openEditAddress"
      @delete-address="openDeleteAddress"
    />

    <EmployeeAccessCard v-if="canViewAccess" v-show="tab === 'akses'" :employee="employee" />

    <EmployeeLeaveBalanceCard v-if="canViewBalance" v-show="tab === 'saldo-cuti'" :employee="employee" />
  </template>

  <!-- Tambah / ubah alamat karyawan -->
  <EmployeeAddressModal
    v-model:open="addressModalOpen"
    :saving="savingAddress"
    :employee-id="employee?.id"
    :address="editingAddress"
    @save="handleSaveAddress"
  />

  <!-- Konfirmasi hapus alamat -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Alamat"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="savingAddress"
    @confirm="handleDeleteAddress"
  />
</template>
