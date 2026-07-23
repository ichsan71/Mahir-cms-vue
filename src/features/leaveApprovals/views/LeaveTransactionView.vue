<script setup>
// Halaman transaksi "Cuti & Izin" — satu menu ber-tab. Tab aktif disinkron ke
// query `?tab`. Pengajuan = listLeave (submission), Persetujuan = listLeaveApproval
// (inbox approver), plus Saldo, Mutasi, Approver Wajib.
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import LeavesView from "@/features/leaveRequests/views/LeavesView.vue";
import LeaveApprovalsView from "./LeaveApprovalsView.vue";
import LeaveBalancesView from "@/features/leaveBalances/views/LeaveBalancesView.vue";
import LeaveBalanceTransactionsView from "@/features/leaveBalanceTransactions/views/LeaveBalanceTransactionsView.vue";
import LeaveMandatoryApproversView from "@/features/leaveMandatoryApprovers/views/LeaveMandatoryApproversView.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const tabs = computed(() =>
  [
    { key: "pengajuan", label: "Pengajuan", permission: "listLeave" },
    { key: "persetujuan", label: "Persetujuan", permission: "listLeaveApproval" },
    { key: "saldo", label: "Saldo Cuti", permission: "listLeaveBalance" },
    { key: "mutasi", label: "Mutasi Saldo", permission: "listLeaveBalanceTransaction" },
    { key: "approver", label: "Approver Wajib", permission: "listLeaveMandatoryApprover" },
  ].filter((t) => auth.can(t.permission)),
);

const activeTab = computed(() => {
  const q = route.query.tab;
  const valid = tabs.value.some((t) => t.key === q);
  return valid ? q : tabs.value[0]?.key;
});

function setTab(key) {
  if (key === activeTab.value) return;
  router.replace({ query: { ...route.query, tab: key } });
}

watch(
  activeTab,
  (key) => {
    if (key && route.query.tab !== key) {
      router.replace({ query: { ...route.query, tab: key } });
    }
  },
  { immediate: true },
);
</script>

<template>
  <!-- Header -->
  <div class="mb-5">
    <h1 class="text-2xl font-bold text-slate-900">Cuti &amp; Izin</h1>
    <p class="text-sm text-mahir-muted">Pengajuan, persetujuan, dan saldo cuti karyawan</p>
  </div>

  <!-- Tab bar (hanya bila lebih dari satu tab tersedia) -->
  <div v-if="tabs.length > 1" class="mb-5 flex flex-wrap gap-1 border-b border-mahir-border">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="relative -mb-px px-4 py-2.5 text-sm font-semibold transition-colors"
      :class="
        activeTab === t.key
          ? 'border-b-2 border-mahir-primary text-mahir-primary'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
      "
      @click="setTab(t.key)"
    >
      {{ t.label }}
    </button>
  </div>

  <!-- Konten tab aktif -->
  <LeavesView v-if="activeTab === 'pengajuan'" />
  <LeaveApprovalsView v-else-if="activeTab === 'persetujuan'" />
  <LeaveBalancesView v-else-if="activeTab === 'saldo'" />
  <LeaveBalanceTransactionsView v-else-if="activeTab === 'mutasi'" />
  <LeaveMandatoryApproversView v-else-if="activeTab === 'approver'" />
</template>
