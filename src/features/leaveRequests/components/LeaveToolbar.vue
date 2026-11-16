<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useLeaveFiltersStore } from "../stores/leaveFilters.store";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/vue/24/outline";

const emit = defineEmits(["add"]);

const auth = useAuthStore();
const filters = useLeaveFiltersStore();
const localSearch = ref(filters.search);

// Pilihan status dari enum backend (LeaveStatusChoices).
const { options: statusOptions, loading: statusLoading } = useEnumChoices("LEAVE_STATUS");

// Default tampilan awal = hanya pengajuan yang "menunggu persetujuan".
// Nama enum backend tidak kita hardcode (bisa WAITING_APPROVAL/PENDING/dll),
// jadi dicocokkan dari daftar opsi begitu termuat — sekali saja, dan hanya bila
// pengguna belum pernah menyentuh filter status.
function matchWaiting(opt) {
  const t = `${opt.value ?? ""} ${opt.label ?? ""}`.toLowerCase();
  return (
    t.includes("menunggu") ||
    t.includes("tunggu") ||
    t.includes("wait") ||
    t.includes("pending")
  );
}

// Pakai flag, bukan stop-handle: dengan { immediate: true } callback jalan
// sinkron saat watch() dibuat (apalagi opsi enum sudah ter-cache saat pindah
// tab), sehingga memanggil stop-handle di dalamnya = akses variabel sebelum
// terinisialisasi (TDZ error).
let statusDefaultApplied = false;
watch(
  statusOptions,
  (opts) => {
    if (statusDefaultApplied || filters.statusTouched || !opts?.length) return;
    const waiting = opts.find(matchWaiting);
    if (waiting) filters.status = waiting.value;
    statusDefaultApplied = true;
  },
  { immediate: true },
);

let timeoutId = null;
function debouncedCommit() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    filters.search = localSearch.value;
  }, 400);
}

watch(localSearch, debouncedCommit);
onUnmounted(() => clearTimeout(timeoutId));

watch(
  () => filters.search,
  (s) => {
    if (s !== localSearch.value) localSearch.value = s;
  },
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        v-model="localSearch"
        type="text"
        placeholder="Cari pengajuan..."
        class="w-[220px] rounded-lg border border-mahir-border py-2 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      />
    </div>

    <select
      v-model="filters.status"
      :disabled="statusLoading"
      class="rounded-lg border border-mahir-border px-3 py-2 text-sm text-slate-700 focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
      @change="filters.statusTouched = true"
    >
      <option value="">Semua Status</option>
      <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>

    <button
      v-if="auth.can(PERM.CREATE)"
      class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-3 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
      @click="emit('add')"
    >
      <PlusIcon class="h-4 w-4" /> Ajukan Cuti
    </button>
  </div>
</template>
