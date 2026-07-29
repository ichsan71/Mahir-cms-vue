<script setup>
import { computed } from "vue";
import { initials } from "@/shared/utils/format";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";

// NOTE: data masih CONTOH (dummy) untuk kebutuhan desain UI.
// TODO: ganti dengan query karyawan yang cuti hari ini (menyusul).
const items = [
  { id: 1, name: "Fahrizal", leaveType: "Half Day", note: "Setengah hari" },
  { id: 2, name: "Dedi Dianto", leaveType: "Cuti Tahunan", note: "1 hari" },
  { id: 3, name: "Siti Aminah", leaveType: "Sakit", note: "2 hari" },
];

const count = computed(() => items.length);

const dateLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <!-- Header -->
    <div class="border-b border-mahir-border px-5 py-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-info-soft text-mahir-info">
            <CalendarDaysIcon class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-[14.5px] font-semibold text-slate-900">Cuti Hari Ini</h2>
            <p class="text-[11.5px] capitalize text-mahir-muted">{{ dateLabel }}</p>
          </div>
        </div>
        <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          contoh
        </span>
      </div>

      <!-- Total -->
      <div class="mt-3 flex items-baseline gap-1.5">
        <span class="text-3xl font-bold leading-none text-slate-900">{{ count }}</span>
        <span class="text-[13px] text-mahir-muted">karyawan sedang cuti</span>
      </div>
    </div>

    <!-- Daftar karyawan cuti -->
    <div class="p-3">
      <div v-if="!count" class="py-10 text-center text-sm text-slate-400">
        Tidak ada karyawan yang cuti hari ini.
      </div>

      <ul v-else class="flex flex-col gap-1.5">
        <li
          v-for="emp in items"
          :key="emp.id"
          class="flex items-center gap-3 rounded-xl border border-mahir-border bg-white px-3 py-2.5"
        >
          <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary">
            {{ initials(emp.name) || "?" }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-[13.5px] font-semibold text-slate-800">{{ emp.name }}</div>
            <div class="flex items-center gap-1.5 text-[12px] text-slate-500">
              <span class="truncate">{{ emp.leaveType }}</span>
              <span v-if="emp.note" class="text-slate-300">·</span>
              <span v-if="emp.note" class="flex-shrink-0">{{ emp.note }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
