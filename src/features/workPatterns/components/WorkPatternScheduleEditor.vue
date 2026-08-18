<script setup>
// Editor jadwal mingguan sebuah pola kerja. Menggabungkan enum WEEKDAY
// dengan `details` yang sudah ada: baris ber-`detailId` → edit, sisanya → create.
import { ref, computed, watch } from "vue";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useShiftSearch } from "@/features/shifts/composables/useShiftSearch";
import { useWorkPatternSchedule } from "../composables/useWorkPatternSchedule";
import { CheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  patternId: { type: [String, Number], required: true },
  details: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
});

const emit = defineEmits(["saved"]);

// Urutan hari Senin → Minggu.
const WEEKDAY_ORDER = {
  MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  SENIN: 1, SELASA: 2, RABU: 3, KAMIS: 4, JUMAT: 5, "JUM'AT": 5, SABTU: 6, MINGGU: 7,
};
function weekdayIndex(w) {
  return WEEKDAY_ORDER[String(w ?? "").toUpperCase().trim()] ?? 99;
}
// Indeks sebuah detail: pakai `weekday`, fallback ke `weekdayDisplay` — agar
// cocok apa pun format backend (nama Inggris/Indonesia/display).
function detailIndex(d) {
  const byWeekday = weekdayIndex(d?.weekday);
  return byWeekday !== 99 ? byWeekday : weekdayIndex(d?.weekdayDisplay);
}

const { options: weekdayOptions } = useEnumChoices("WEEKDAY");
const { options: shiftOptions, loading: shiftLoading, setSearch } = useShiftSearch();
const { saveSchedule, loading: saving } = useWorkPatternSchedule();

// Basis daftar hari: pakai enum bila sudah termuat, jika belum fallback ke details.
const baseWeekdays = computed(() => {
  if (weekdayOptions.value.length) return weekdayOptions.value;
  return (props.details ?? []).map((d) => ({ value: d.weekday, label: d.weekdayDisplay || d.weekday }));
});

const rows = ref([]);

function buildRows() {
  // Kunci per indeks hari (bukan string persis) agar nama enum & nilai `weekday`
  // backend yang beda format tetap cocok.
  const byIndex = new Map();
  (props.details ?? []).forEach((d) => byIndex.set(detailIndex(d), d));
  rows.value = baseWeekdays.value
    .map((opt) => {
      const d = byIndex.get(weekdayIndex(opt.value));
      return {
        weekday: opt.value,
        label: d?.weekdayDisplay || opt.label,
        detailId: d?.id ?? null,
        isWorkday: d?.isWorkday ?? false,
        shiftId: d?.shift?.id ?? "",
        shiftSelected: d?.shift ?? null,
      };
    })
    .sort((a, b) => weekdayIndex(a.weekday) - weekdayIndex(b.weekday));
}

watch([baseWeekdays, () => props.details], buildRows, { immediate: true });

function fmtTime(t) {
  return t ? String(t).slice(0, 5) : "—";
}

async function onSave() {
  const ok = await saveSchedule(props.patternId, rows.value);
  if (ok) emit("saved");
}
</script>

<template>
  <!-- Mode edit: toggle hari kerja + pemilih shift per hari -->
  <div v-if="editable">
    <ul class="divide-y divide-slate-100">
      <li v-for="(row, i) in rows" :key="row.weekday" class="flex flex-wrap items-center gap-3 py-3">
        <span class="w-24 flex-shrink-0 text-sm font-medium text-slate-700">{{ row.label }}</span>

        <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input v-model="row.isWorkday" type="checkbox" class="h-4 w-4 accent-mahir-primary" />
          Hari kerja
        </label>

        <div class="min-w-[200px] flex-1">
          <SearchableSelect
            v-if="row.isWorkday"
            v-model="rows[i].shiftId"
            :selected="row.shiftSelected"
            :options="shiftOptions"
            :loading="shiftLoading"
            placeholder="Pilih shift"
            search-placeholder="Cari shift…"
            @search="setSearch"
          />
          <span v-else class="text-sm text-slate-400">Libur</span>
        </div>
      </li>
    </ul>

    <div class="mt-4 flex justify-end">
      <button
        class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:opacity-60"
        :disabled="saving"
        @click="onSave"
      >
        <CheckIcon class="h-4 w-4" /> {{ saving ? "Menyimpan…" : "Simpan Jadwal" }}
      </button>
    </div>
  </div>

  <!-- Mode baca (tanpa izin ubah) -->
  <ul v-else class="divide-y divide-slate-100">
    <li v-for="row in rows" :key="row.weekday" class="flex items-center justify-between gap-3 py-2.5">
      <span class="text-sm font-medium text-slate-700">{{ row.label }}</span>
      <span class="flex items-center gap-2">
        <span v-if="row.isWorkday && row.shiftSelected" class="font-mono text-[12px] text-slate-500">
          {{ fmtTime(row.shiftSelected.startTime) }}–{{ fmtTime(row.shiftSelected.endTime) }}
        </span>
        <span
          class="rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
          :class="row.isWorkday ? 'bg-mahir-primary-soft text-mahir-primary' : 'bg-slate-100 text-slate-400'"
        >
          {{ row.isWorkday ? "Hari Kerja" : "Libur" }}
        </span>
      </span>
    </li>
  </ul>
</template>
