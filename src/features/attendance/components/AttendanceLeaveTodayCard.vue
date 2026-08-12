<script setup>
import { initials } from "@/shared/utils/format";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";
import { useLeaveToday } from "../composables/useLeaveToday";

const { items, count, loading } = useLeaveToday();

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
      <div class="flex items-center gap-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-info-soft text-mahir-info">
          <CalendarDaysIcon class="h-5 w-5" />
        </span>
        <div>
          <h2 class="text-[14.5px] font-semibold text-slate-900">Cuti Hari Ini</h2>
          <p class="text-[11.5px] capitalize text-mahir-muted">{{ dateLabel }}</p>
        </div>
      </div>

      <!-- Total -->
      <div class="mt-3 flex items-baseline gap-1.5">
        <span class="text-3xl font-bold leading-none text-slate-900">{{ count }}</span>
        <span class="text-[13px] text-mahir-muted">karyawan sedang cuti</span>
      </div>
    </div>

    <!-- Daftar karyawan cuti -->
    <div class="p-3">
      <div v-if="loading && !count" class="py-10 text-center text-sm text-slate-400">
        Memuat data…
      </div>

      <div v-else-if="!count" class="py-10 text-center text-sm text-slate-400">
        Tidak ada karyawan yang cuti hari ini.
      </div>

      <ul v-else class="flex flex-col gap-1.5">
        <li
          v-for="leave in items"
          :key="leave.id"
          class="flex items-center gap-3 rounded-xl border border-mahir-border bg-white px-3 py-2.5"
        >
          <img
            v-if="leave.employee?.image"
            :src="leave.employee.image"
            :alt="leave.employee?.fullName"
            class="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          />
          <span
            v-else
            class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary"
          >
            {{ initials(leave.employee?.fullName) || "?" }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-[13.5px] font-semibold text-slate-800">
              {{ leave.employee?.fullName || "—" }}
            </div>
            <div class="flex items-center gap-1.5 text-[12px] text-slate-500">
              <span class="truncate">{{ leave.leaveType?.name || "Cuti" }}</span>
              <span v-if="leave.employee?.roleName" class="text-slate-300">·</span>
              <span v-if="leave.employee?.roleName" class="flex-shrink-0 truncate">
                {{ leave.employee.roleName }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
