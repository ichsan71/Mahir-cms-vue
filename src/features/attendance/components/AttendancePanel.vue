<script setup>
import { ref } from "vue";
import AttendanceListPanel from "./AttendanceListPanel.vue";
import AttendanceCalendar from "./AttendanceCalendar.vue";
import { CalendarDaysIcon, ListBulletIcon } from "@heroicons/vue/24/outline";

defineProps({
  // "self" = kehadiran diri sendiri; "team" = kehadiran tim.
  scope: { type: String, default: "self" },
});

// Toggle tampilan hanya untuk scope "self": "calendar" (default) atau "list".
const viewMode = ref("calendar");

const modes = [
  { key: "calendar", label: "Kalender", icon: CalendarDaysIcon },
  { key: "list", label: "Daftar", icon: ListBulletIcon },
];
</script>

<template>
  <!-- Toggle tampilan (khusus Kehadiran Saya) -->
  <div v-if="scope === 'self'" class="mb-5 inline-flex rounded-xl border border-mahir-border bg-white p-1">
    <button
      v-for="m in modes"
      :key="m.key"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
      :class="viewMode === m.key
        ? 'bg-mahir-primary text-white'
        : 'text-slate-500 hover:text-slate-800'"
      @click="viewMode = m.key"
    >
      <component :is="m.icon" class="h-4 w-4" />
      {{ m.label }}
    </button>
  </div>

  <AttendanceCalendar v-if="scope === 'self' && viewMode === 'calendar'" />
  <AttendanceListPanel v-else :scope="scope" />
</template>
