<script setup>
// Kartu daftar karyawan per status (Terlambat / Cuti-Izin / Belum Absen) untuk
// Dashboard. Menampilkan maksimal 5 nama; bila lebih, tombol "Lihat semua"
// membuka modal berisi daftar lengkap (scrollable) agar tinggi kartu tetap.
// Data (array {id, fullName}) berasal dari attendanceDashboard.
import { ref, computed } from "vue";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  employees: { type: Array, default: () => [] },
  variant: { type: String, default: "amber" }, // amber | blue | slate
  emptyText: { type: String, default: "Tidak ada data" },
  expanded: { type: Boolean, default: false }, // dikontrol parent (buka satu-satu)
});

const emit = defineEmits(["toggle"]);

// Kelas Tailwind ditulis penuh sebagai literal agar terdeteksi JIT.
const VARIANTS = {
  amber: {
    icon: "text-amber-500",
    badge: "bg-amber-50 text-amber-600",
    chip: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    link: "text-amber-600 hover:text-amber-700",
  },
  blue: {
    icon: "text-blue-500",
    badge: "bg-blue-50 text-blue-600",
    chip: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    link: "text-blue-600 hover:text-blue-700",
  },
  slate: {
    icon: "text-slate-500",
    badge: "bg-slate-100 text-slate-600",
    chip: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    link: "text-slate-600 hover:text-slate-700",
  },
};

const LIMIT = 5;
const open = ref(false); // modal daftar lengkap
const c = computed(() => VARIANTS[props.variant] ?? VARIANTS.amber);
const visible = computed(() => props.employees.slice(0, LIMIT));
const hiddenCount = computed(() => Math.max(props.employees.length - LIMIT, 0));
</script>

<template>
  <div class="flex flex-col rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
    <!-- Header accordion (klik untuk buka/tutup) -->
    <button
      type="button"
      class="flex w-full items-center gap-2 text-left"
      :aria-expanded="expanded"
      @click="emit('toggle')"
    >
      <component :is="icon" class="h-4 w-4" :class="c.icon" />
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <span
        class="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="c.badge"
      >
        {{ employees.length }}
      </span>
      <ChevronDownIcon
        class="h-4 w-4 text-slate-400 transition-transform"
        :class="{ 'rotate-180': expanded }"
      />
    </button>

    <!-- Body (collapsible) -->
    <div v-show="expanded" class="mt-3">
      <div v-if="employees.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="e in visible"
          :key="e.id"
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          :class="c.chip"
        >
          <span class="h-1 w-1 rounded-full" :class="c.dot"></span>
          {{ e.fullName }}
        </span>

        <button
          v-if="hiddenCount > 0"
          type="button"
          class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
          :class="c.chip"
          @click="open = true"
        >
          +{{ hiddenCount }} lainnya
        </button>
      </div>
      <p v-else class="text-[11px] text-slate-400">{{ emptyText }}</p>
    </div>

    <!-- Modal daftar lengkap (read-only, scrollable) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="open"
          class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
          @click.self="open = false"
        >
          <div class="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-mahir-border px-5 py-4">
              <div class="flex items-center gap-2">
                <component :is="icon" class="h-4 w-4" :class="c.icon" />
                <h5 class="text-sm font-semibold text-slate-900">{{ title }}</h5>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="c.badge"
                >
                  {{ employees.length }}
                </span>
              </div>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                @click="open = false"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>

            <!-- Body: daftar nama scrollable -->
            <div class="flex flex-wrap gap-1.5 overflow-y-auto px-5 py-4">
              <span
                v-for="e in employees"
                :key="e.id"
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="c.chip"
              >
                <span class="h-1 w-1 rounded-full" :class="c.dot"></span>
                {{ e.fullName }}
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
