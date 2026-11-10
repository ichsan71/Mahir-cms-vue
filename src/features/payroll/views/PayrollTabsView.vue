<script setup>
// Halaman "Penggajian" — satu menu ber-tab (pola sama dgn "Cuti & Izin").
// Tab aktif disinkron ke query `?tab`. Tab difilter permission: hanya yang
// izinnya dimiliki user yang tampil (superuser lolos semua).
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import PayslipsView from "@/features/payslips/views/PayslipsView.vue";
import PayslipApprovalsView from "@/features/payslips/views/PayslipApprovalsView.vue";
import PayrollView from "./PayrollView.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const tabs = computed(() =>
  [
    { key: "slip", label: "Slip Gaji", permission: "listPayslip" },
    { key: "persetujuan", label: "Persetujuan", permission: "listPayslipApproval" },
    { key: "potongan", label: "Potongan Gaji", permission: "listEmployeeSalaryDeduction" },
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
    <h1 class="text-2xl font-bold text-slate-900">Penggajian</h1>
    <p class="text-sm text-mahir-muted">Slip gaji, persetujuan, dan potongan gaji karyawan</p>
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
  <PayslipsView v-if="activeTab === 'slip'" />
  <PayslipApprovalsView v-else-if="activeTab === 'persetujuan'" />
  <PayrollView v-else-if="activeTab === 'potongan'" />
</template>
