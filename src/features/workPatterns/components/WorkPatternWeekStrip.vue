<script setup>
import { computed } from "vue";

const props = defineProps({
  details: { type: Array, default: () => [] },
});

// Urutan hari agar strip selalu tampil Senin → Minggu, apa pun urutan dari API.
const WEEKDAY_ORDER = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  SENIN: 1, SELASA: 2, RABU: 3, KAMIS: 4, JUMAT: 5, "JUM'AT": 5, SABTU: 6, MINGGU: 7,
};

function weekdayIndex(d) {
  const key = String(d?.weekday ?? d?.weekdayDisplay ?? "").toUpperCase().trim();
  return WEEKDAY_ORDER[key] ?? 99;
}

// Label singkat 3 huruf untuk chip ("Senin" → "Sen", "Monday" → "Mon").
function shortDay(d) {
  return String(d?.weekdayDisplay ?? d?.weekday ?? "—").slice(0, 3);
}

// Jam ringkas "HH:MM" (buang detik bila ada).
function fmtTime(t) {
  return t ? String(t).slice(0, 5) : "—";
}

const ordered = computed(() =>
  [...(props.details ?? [])].sort((a, b) => weekdayIndex(a) - weekdayIndex(b)),
);
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <div
      v-for="d in ordered"
      :key="d.id"
      class="flex min-w-[58px] flex-col items-center rounded-lg border px-2 py-1.5 text-center"
      :class="
        d.isWorkday
          ? 'border-mahir-primary/25 bg-mahir-primary-soft text-mahir-primary'
          : 'border-mahir-border bg-slate-50 text-slate-400'
      "
      :title="
        d.isWorkday && d.shift
          ? `${d.weekdayDisplay}: ${fmtTime(d.shift.startTime)}–${fmtTime(d.shift.endTime)}`
          : `${d.weekdayDisplay}: Libur`
      "
    >
      <span class="text-[11px] font-semibold uppercase tracking-wide">{{ shortDay(d) }}</span>
      <span v-if="d.isWorkday && d.shift" class="mt-0.5 font-mono text-[11px] leading-tight">
        {{ fmtTime(d.shift.startTime) }}<br />{{ fmtTime(d.shift.endTime) }}
      </span>
      <span v-else class="mt-0.5 text-[11px] leading-tight">Libur</span>
    </div>
    <span v-if="!ordered.length" class="text-[13px] text-slate-400">Belum ada jadwal harian</span>
  </div>
</template>
