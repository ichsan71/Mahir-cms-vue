<script setup>
import { ref, computed } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import { formatDate, formatTime, formatDuration, initials } from "@/shared/utils/format";
import {
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  PhotoIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  // Kelompokkan baris per karyawan dengan sub-header (dipakai di tab "Kehadiran
  // Tim" saat menampilkan "Semua"). Bila false → satu list datar.
  grouped: { type: Boolean, default: false },
});

// Baris dikelompokkan per karyawan bila `grouped`; jika tidak, satu grup tanpa header.
const groups = computed(() => {
  if (!props.grouped) return [{ key: "_all", name: null, rows: props.records }];
  const map = new Map();
  for (const r of props.records) {
    const id = r.employee?.id ?? "_none";
    if (!map.has(id)) {
      map.set(id, { key: id, name: r.employee?.fullName || "—", rows: [] });
    }
    map.get(id).rows.push(r);
  }
  return [...map.values()];
});

// Baris yang sedang di-expand (berisi id).
const expanded = ref(new Set());
function toggle(id) {
  const next = new Set(expanded.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expanded.value = next;
}
const isExpanded = (id) => expanded.value.has(id);

// Nama hari singkat dari tanggal, mis. "Jumat".
function weekday(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(d);
}

// Kategori arah log dari attendanceType ("...OUT..." → keluar, "...IN..." → masuk).
function logDir(type) {
  const t = String(type ?? "").toLowerCase();
  if (t.includes("out")) return "out";
  if (t.includes("in")) return "in";
  return "other";
}

// Log terurut menaik berdasarkan waktu.
function sortedLogs(logs) {
  return [...(logs ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

// Jam masuk aktual = log "masuk" paling awal; keluar = log "keluar" paling akhir.
function actualIn(row) {
  const ins = sortedLogs(row.logs).filter((l) => logDir(l.attendanceType) === "in");
  return ins.length ? ins[0].timestamp : null;
}
function actualOut(row) {
  const outs = sortedLogs(row.logs).filter((l) => logDir(l.attendanceType) === "out");
  return outs.length ? outs[outs.length - 1].timestamp : null;
}

function mapsUrl(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// `shift` = objek { name, start_time, end_time, break_start, break_end,
// is_flexible, late_tolerance, early_leave_tolerance }. Jam terjadwal memakai
// scheduledCheckIn/Out bila ada, jika tidak jatuh ke jam shift.
function schedIn(row) {
  return row.scheduledCheckIn || row.shift?.start_time || null;
}
function schedOut(row) {
  return row.scheduledCheckOut || row.shift?.end_time || null;
}
</script>

<template>
  <div class="px-5 pb-5">
    <div v-if="loading && !records.length" class="py-12 text-center text-sm text-slate-400">
      Memuat data…
    </div>
    <div v-else-if="!records.length" class="py-12 text-center text-sm text-slate-400">
      Tidak ada catatan kehadiran yang cocok.
    </div>

    <div v-else class="flex flex-col gap-5">
     <div v-for="g in groups" :key="g.key">
      <!-- Sub-header karyawan (mode grup per bawahan) -->
      <div v-if="g.name" class="mb-2 flex items-center gap-2.5 px-1">
        <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-mahir-primary-soft text-[11px] font-bold text-mahir-primary">
          {{ initials(g.name) || "?" }}
        </span>
        <span class="text-[14px] font-bold text-slate-800">{{ g.name }}</span>
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{{ g.rows.length }} hari</span>
      </div>

      <div class="flex flex-col gap-2.5">
      <div
        v-for="row in g.rows"
        :key="row.id"
        class="overflow-hidden rounded-xl border border-mahir-border bg-white transition hover:border-mahir-primary/40"
      >
        <!-- Ringkasan baris -->
        <button
          type="button"
          class="flex w-full items-center gap-4 px-4 py-3 text-left"
          @click="toggle(row.id)"
        >
          <ChevronRightIcon
            class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform"
            :class="{ 'rotate-90': isExpanded(row.id) }"
          />

          <!-- Tanggal -->
          <div class="w-[130px] flex-shrink-0">
            <div class="text-[13.5px] font-semibold text-slate-800">{{ formatDate(row.date) }}</div>
            <div class="text-[11.5px] text-slate-400">{{ weekday(row.date) }}</div>
          </div>

          <!-- Shift -->
          <div class="hidden w-[120px] flex-shrink-0 sm:block">
            <div class="text-[11px] uppercase tracking-wide text-slate-400">Shift</div>
            <div class="truncate text-[13px] font-medium text-slate-700">{{ row.shift?.name || "—" }}</div>
            <span
              v-if="row.shift?.is_flexible"
              class="mt-0.5 inline-block rounded bg-mahir-info-soft px-1.5 py-px text-[10px] font-semibold text-mahir-info"
            >
              Fleksibel
            </span>
          </div>

          <!-- Jadwal vs aktual -->
          <div class="hidden flex-1 items-center gap-6 md:flex">
            <div>
              <div class="text-[11px] uppercase tracking-wide text-slate-400">Jadwal</div>
              <div class="text-[13px] font-medium text-slate-500">
                {{ formatTime(schedIn(row)) }} – {{ formatTime(schedOut(row)) }}
              </div>
            </div>
            <div>
              <div class="text-[11px] uppercase tracking-wide text-slate-400">Aktual</div>
              <div class="text-[13px] font-semibold text-slate-800">
                <span :class="actualIn(row) ? 'text-mahir-success' : 'text-slate-300'">
                  {{ formatTime(actualIn(row)) }}
                </span>
                <span class="mx-1 text-slate-300">–</span>
                <span :class="actualOut(row) ? 'text-mahir-danger' : 'text-slate-300'">
                  {{ formatTime(actualOut(row)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Durasi + penanda -->
          <div class="hidden w-[150px] flex-shrink-0 flex-col items-end gap-1 lg:flex">
            <span class="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-700">
              <ClockIcon class="h-3.5 w-3.5 text-slate-400" />
              {{ formatDuration(row.workedSeconds, { zeroDash: true }) }}
            </span>
            <div class="flex flex-wrap justify-end gap-1">
              <span
                v-if="Number(row.lateSeconds) > 0"
                class="rounded bg-mahir-warning-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-warning"
              >
                Telat {{ formatDuration(row.lateSeconds) }}
              </span>
              <span
                v-if="Number(row.earlyLeaveSeconds) > 0"
                class="rounded bg-mahir-danger-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-danger"
              >
                Pulang cepat {{ formatDuration(row.earlyLeaveSeconds) }}
              </span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex-shrink-0">
            <StatusBadge :status="String(row.status ?? '').toLowerCase()" />
          </div>
        </button>

        <!-- Detail log (expand) -->
        <div v-if="isExpanded(row.id)" class="border-t border-mahir-border bg-slate-50/70 px-4 py-4">
          <!-- Info shift -->
          <div
            v-if="row.shift"
            class="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-mahir-border bg-white px-3.5 py-2.5 text-[12px]"
          >
            <span class="font-semibold text-slate-700">{{ row.shift.name }}</span>
            <span class="text-slate-500">
              Kerja
              <span class="font-medium text-slate-700">{{ formatTime(row.shift.start_time) }}–{{ formatTime(row.shift.end_time) }}</span>
            </span>
            <span v-if="row.shift.break_start || row.shift.break_end" class="text-slate-500">
              Istirahat
              <span class="font-medium text-slate-700">{{ formatTime(row.shift.break_start) }}–{{ formatTime(row.shift.break_end) }}</span>
            </span>
            <span v-if="row.shift.late_tolerance != null" class="text-slate-500">
              Toleransi telat <span class="font-medium text-slate-700">{{ row.shift.late_tolerance }} mnt</span>
            </span>
            <span v-if="row.shift.early_leave_tolerance != null" class="text-slate-500">
              Toleransi pulang cepat <span class="font-medium text-slate-700">{{ row.shift.early_leave_tolerance }} mnt</span>
            </span>
          </div>

          <div class="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Riwayat Tap ({{ (row.logs || []).length }})
          </div>

          <div v-if="!row.logs?.length" class="py-3 text-center text-[13px] text-slate-400">
            Tidak ada log absensi untuk hari ini.
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="log in sortedLogs(row.logs)"
              :key="log.id"
              class="flex items-start gap-3 rounded-lg border border-mahir-border bg-white p-3"
            >
              <!-- Ikon arah -->
              <div
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                :class="logDir(log.attendanceType) === 'out'
                  ? 'bg-mahir-danger-soft text-mahir-danger'
                  : 'bg-mahir-success-soft text-mahir-success'"
              >
                <component
                  :is="logDir(log.attendanceType) === 'out' ? ArrowRightOnRectangleIcon : ArrowLeftOnRectangleIcon"
                  class="h-5 w-5"
                />
              </div>

              <!-- Info log -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[13.5px] font-semibold text-slate-800">
                    {{ formatTime(log.timestamp) }}
                  </span>
                  <span class="text-[12px] font-medium text-slate-500">
                    {{ log.attendanceType || "—" }}
                  </span>
                  <span
                    v-if="log.isManual"
                    class="inline-flex items-center gap-1 rounded bg-mahir-info-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-mahir-info"
                  >
                    <PencilSquareIcon class="h-3 w-3" /> Manual
                  </span>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                  <span v-if="log.source" class="inline-flex items-center gap-1">
                    <DevicePhoneMobileIcon class="h-3.5 w-3.5 text-slate-400" />
                    {{ log.source }}
                  </span>
                  <a
                    v-if="mapsUrl(log.latitude, log.longitude)"
                    :href="mapsUrl(log.latitude, log.longitude)"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1 text-mahir-primary hover:underline"
                  >
                    <MapPinIcon class="h-3.5 w-3.5" /> Lihat lokasi
                  </a>
                </div>

                <div v-if="log.note" class="mt-1 text-[12px] italic text-slate-500">
                  "{{ log.note }}"
                </div>
              </div>

              <!-- Foto bukti -->
              <a
                v-if="log.image"
                :href="log.image"
                target="_blank"
                rel="noopener"
                class="flex-shrink-0"
                title="Lihat foto"
              >
                <img
                  :src="log.image"
                  alt="Bukti absensi"
                  class="h-14 w-14 rounded-lg border border-mahir-border object-cover"
                />
              </a>
              <div
                v-else
                class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-mahir-border text-slate-300"
              >
                <PhotoIcon class="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
     </div>
    </div>
  </div>
</template>
