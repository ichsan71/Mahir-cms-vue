<script setup>
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import AttendancePanel from "../components/AttendancePanel.vue";

const auth = useAuthStore();

// Tab "Tim" hanya untuk atasan (punya bawahan langsung / childrens).
const tabs = computed(() => {
  const list = [{ key: "self", label: "Kehadiran Saya" }];
  if (auth.childrenIds.length) list.push({ key: "team", label: "Kehadiran Tim" });
  return list;
});

const activeTab = ref("self");

// Jaga agar tab aktif selalu valid (mis. akun tanpa bawahan tak bisa di tab "team").
watch(
  tabs,
  (list) => {
    if (!list.some((t) => t.key === activeTab.value)) activeTab.value = list[0]?.key ?? "self";
  },
  { immediate: true },
);
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Kehadiran</h1>
      <p class="text-sm text-mahir-muted">Rekap kehadiran harian beserta riwayat tap masuk & keluar</p>
    </div>
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
      @click="activeTab = t.key"
    >
      {{ t.label }}
    </button>
  </div>

  <!-- Konten tab aktif. `key` memaksa remount saat pindah tab (reset ke halaman 1). -->
  <AttendancePanel :key="activeTab" :scope="activeTab" />
</template>
