<script setup>
// Halaman "Profil Saya" — data karyawan milik user yang login. Memakai SATU
// panggilan getEmployee(id-sendiri) (query GET_MY_PROFILE) yang sekaligus
// menarik semua field nested yang perlu ditampilkan (saldo cuti, gaji, rekening,
// dll). Dengan begitu user melihat datanya sendiri tanpa memanggil query list
// yang di-gate permission backend. Tata letaknya ber-tab seperti Detail Karyawan,
// tapi read-only. Paginasi tiap section dikirim sebagai param ke query ini.
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useAuth } from "@/features/auth/composables/useAuth";
import { GET_MY_PROFILE } from "../graphql/employee.queries";
import EmployeeProfileCard from "../components/EmployeeProfileCard.vue";
import ProfileLeaveBalanceCard from "../components/ProfileLeaveBalanceCard.vue";
import ProfilePayslipCard from "../components/ProfilePayslipCard.vue";
import ProfileBankAccountCard from "../components/ProfileBankAccountCard.vue";
import ProfileBpjsCard from "../components/ProfileBpjsCard.vue";
import ProfileTaxInfoCard from "../components/ProfileTaxInfoCard.vue";
import ProfileEmergencyContactCard from "../components/ProfileEmergencyContactCard.vue";
import ProfileFamilyMemberCard from "../components/ProfileFamilyMemberCard.vue";
import ChangePasswordModal from "@/features/auth/components/ChangePasswordModal.vue";
import { ArrowPathIcon, UserMinusIcon, KeyIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const { changePassword, loading: changingPassword } = useAuth();

// Id karyawan dari sesi login. Bila akun tak tertaut employee, id null → query
// tidak dijalankan dan tampil state "tidak ditemukan".
const employeeId = computed(() => auth.employee?.id ?? null);

// Halaman paginasi per section (pageSize tetap). Mengubah salah satunya akan
// me-refetch GET_MY_PROFILE dengan param section tsb; section lain tak berubah.
const PAGE_SIZE = 10;
const leaveBalancePage = ref(1);
const bankAccountPage = ref(1);
const emergencyContactPage = ref(1);
const familyMemberPage = ref(1);

const { result, loading } = useQuery(
  GET_MY_PROFILE,
  () => ({
    getEmployeeId: employeeId.value,
    leaveBalanceParams: { page: leaveBalancePage.value, pageSize: PAGE_SIZE },
    bankAccountParams: { page: bankAccountPage.value, pageSize: PAGE_SIZE },
    emergencyContactParams: { page: emergencyContactPage.value, pageSize: PAGE_SIZE },
    familyMemberParams: { page: familyMemberPage.value, pageSize: PAGE_SIZE },
  }),
  () => ({ enabled: employeeId.value !== null, fetchPolicy: "cache-and-network" }),
);

const employee = computed(() => result.value?.getEmployee?.data ?? null);

// Objek paginasi nested per section (atau null bila belum dimuat).
const leaveBalances = computed(() => employee.value?.leaveBalances ?? null);
const bankAccounts = computed(() => employee.value?.bankAccounts ?? null);
const emergencyContacts = computed(() => employee.value?.emergencyContacts ?? null);
const familyMembers = computed(() => employee.value?.familyMembers ?? null);

// Navigasi halaman per section — dijaga oleh hasNext/hasPrev dari data.
function makeNav(pageRef, paginateRef) {
  return {
    next: () => {
      if (paginateRef.value?.hasNext) pageRef.value += 1;
    },
    prev: () => {
      if (paginateRef.value?.hasPrev && pageRef.value > 1) pageRef.value -= 1;
    },
  };
}
const leaveNav = makeNav(leaveBalancePage, leaveBalances);
const bankNav = makeNav(bankAccountPage, bankAccounts);
const emergencyNav = makeNav(emergencyContactPage, emergencyContacts);
const familyNav = makeNav(familyMemberPage, familyMembers);

// Tab layout seperti Detail Karyawan — semua read-only untuk diri sendiri.
const tabs = [
  { id: "profil", label: "Profil" },
  { id: "saldo-cuti", label: "Saldo Cuti" },
  { id: "slip-gaji", label: "Slip Gaji" },
  { id: "rekening-bank", label: "Rekening Bank" },
  { id: "bpjs", label: "BPJS" },
  { id: "pajak", label: "Pajak" },
  { id: "kontak-darurat", label: "Kontak Darurat" },
  { id: "keluarga", label: "Keluarga" },
];
const tab = ref("profil");

// Modal ubah password. Sukses → changePassword otomatis logout (redirect ke
// login), jadi tak perlu menutup modal secara manual.
const passwordModalOpen = ref(false);

async function handleChangePassword(payload) {
  await changePassword(payload);
}
</script>

<template>
  <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="text-sm text-mahir-muted">
        Selamat datang, {{ auth.displayName }}. Berikut data kepegawaian Anda.
      </p>
    </div>
    <button
      class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      @click="passwordModalOpen = true"
    >
      <KeyIcon class="h-4 w-4" /> Ubah Password
    </button>
  </div>

  <div v-if="loading && !employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <ArrowPathIcon class="h-7 w-7 animate-spin text-mahir-primary mb-3" />
    <p class="text-sm font-medium text-slate-500">Memuat data Anda...</p>
  </div>

  <div v-else-if="!employee" class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center">
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <UserMinusIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data karyawan Anda tidak ditemukan</p>
    <p class="text-xs text-slate-400 mt-1">Akun Anda mungkin belum tertaut ke data karyawan. Hubungi super admin.</p>
  </div>

  <template v-else>
    <!-- Tab navigasi (seperti Detail Karyawan) -->
    <div class="mb-5 flex flex-wrap gap-1 border-b border-mahir-border">
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

    <EmployeeProfileCard v-show="tab === 'profil'" :employee="employee" />

    <ProfileLeaveBalanceCard
      v-show="tab === 'saldo-cuti'"
      :paginate="leaveBalances"
      :loading="loading"
      @next="leaveNav.next"
      @prev="leaveNav.prev"
    />

    <ProfilePayslipCard v-show="tab === 'slip-gaji'" :employee-id="employee.id" />

    <ProfileBankAccountCard
      v-show="tab === 'rekening-bank'"
      :paginate="bankAccounts"
      :loading="loading"
      @next="bankNav.next"
      @prev="bankNav.prev"
    />

    <ProfileBpjsCard v-show="tab === 'bpjs'" :bpjs="employee.bpjs" />

    <ProfileTaxInfoCard v-show="tab === 'pajak'" :tax-info="employee.taxInfo" />

    <ProfileEmergencyContactCard
      v-show="tab === 'kontak-darurat'"
      :paginate="emergencyContacts"
      :loading="loading"
      @next="emergencyNav.next"
      @prev="emergencyNav.prev"
    />

    <ProfileFamilyMemberCard
      v-show="tab === 'keluarga'"
      :paginate="familyMembers"
      :loading="loading"
      @next="familyNav.next"
      @prev="familyNav.prev"
    />
  </template>

  <!-- Ubah password akun sendiri -->
  <ChangePasswordModal
    v-model:open="passwordModalOpen"
    :saving="changingPassword"
    @submit="handleChangePassword"
  />
</template>
