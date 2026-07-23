<script setup>
// Halaman gabungan: Aturan Cuti & Tipe Cuti dalam satu menu (dua tab) karena
// saling berhubungan. Tab aktif disinkron ke query `?tab` agar bisa dibagikan &
// kembali dari halaman detail ke tab yang benar.
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import LeaveRulesView from "./LeaveRulesView.vue";
import LeaveTypesView from "@/features/leaveTypes/views/LeaveTypesView.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// Tab hanya tampil bila user punya izin list-nya (superuser lolos otomatis).
const tabs = computed(() =>
  [
    { key: "aturan-cuti", label: "Aturan Cuti", permission: "listLeaveRule" },
    { key: "tipe-cuti", label: "Tipe Cuti", permission: "listLeaveType" },
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

// Normalisasi URL bila `?tab` kosong/tak valid agar cocok dengan tab aktif.
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
    <h1 class="text-2xl font-bold text-slate-900">Pengaturan Cuti</h1>
    <p class="text-sm text-mahir-muted">Kelola tipe cuti dan aturan kuota cuti per perusahaan</p>
  </div>

  <!-- Tab bar (hanya bila lebih dari satu tab tersedia) -->
  <div v-if="tabs.length > 1" class="mb-5 flex gap-1 border-b border-mahir-border">
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
  <LeaveRulesView v-if="activeTab === 'aturan-cuti'" />
  <LeaveTypesView v-else-if="activeTab === 'tipe-cuti'" />
</template>
