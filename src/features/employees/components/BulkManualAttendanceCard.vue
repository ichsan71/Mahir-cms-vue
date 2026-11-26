<script setup>
// Tab "Kelola Kehadiran" di halaman Karyawan: input/edit kehadiran manual
// BANYAK karyawan & tanggal sekaligus (lintas-karyawan) via setManualAttendanceBulk.
//
// Alur: pilih beberapa karyawan + satu tanggal + jam default → "Tambah ke daftar"
// menambahkan satu baris per karyawan. Tiap baris bisa diubah (tanggal/jam/catatan)
// atau dihapus. "Simpan Semua" mengirim seluruh baris dalam satu permintaan.
import { ref, computed, watch } from "vue";
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  UsersIcon,
  DocumentArrowUpIcon,
} from "@heroicons/vue/24/outline";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import ImportAttendanceModal from "@/features/attendance/components/ImportAttendanceModal.vue";
import { useEmployeeSearch } from "../composables/useEmployeeSearch";
import { useBulkManualAttendance } from "@/features/attendance/composables/useBulkManualAttendance";
import { useToastStore } from "@/stores/toast.store";

const toast = useToastStore();
const { saveBulk, submitting } = useBulkManualAttendance();

// ── Panel "Tambah" ────────────────────────────────────────────────────────
const { options, loading, setSearch } = useEmployeeSearch();

// Peta id→nama yang terakumulasi dari hasil pencarian, agar nama karyawan
// terpilih tetap dikenali meski daftar opsi berubah saat mengetik pencarian.
const knownNames = ref({});
watch(options, (opts) => {
  for (const o of opts) knownNames.value[o.id] = o.name;
});

const pickedIds = ref([]);
const pickedEmployees = computed(() =>
  pickedIds.value.map((id) => ({ id, name: knownNames.value[id] ?? `#${id}` })),
);

const todayStr = toDateInput(new Date());
const formDate = ref(todayStr);
const formCheckIn = ref("08:00");
const formCheckOut = ref("17:00");

// ── Daftar baris yang akan disimpan ─────────────────────────────────────────
// Tiap baris: { key, employeeId, employeeName, date, checkIn, checkOut, note }.
const rows = ref([]);
let rowSeq = 0;

// Impor dari berkas (CSV/XLSX) — jalur alternatif selain input baris manual.
const importOpen = ref(false);

function addRows() {
  if (!pickedIds.value.length) {
    toast.error("Pilih minimal satu karyawan dulu.");
    return;
  }
  if (!formDate.value || !formCheckIn.value) {
    toast.error("Tanggal dan jam masuk wajib diisi.");
    return;
  }
  let added = 0;
  let skipped = 0;
  for (const emp of pickedEmployees.value) {
    // Hindari duplikat baris untuk kombinasi karyawan + tanggal yang sama.
    const dup = rows.value.some(
      (r) => String(r.employeeId) === String(emp.id) && r.date === formDate.value,
    );
    if (dup) {
      skipped += 1;
      continue;
    }
    rows.value.push({
      key: ++rowSeq,
      employeeId: emp.id,
      employeeName: emp.name,
      date: formDate.value,
      checkIn: formCheckIn.value,
      checkOut: formCheckOut.value,
      note: "",
    });
    added += 1;
  }
  if (added) toast.success(`${added} baris ditambahkan.`);
  if (skipped)
    toast.error(`${skipped} baris dilewati (karyawan & tanggal sudah ada).`);

  // Reset pilihan karyawan agar siap batch berikutnya; tanggal & jam dibiarkan.
  pickedIds.value = [];
}

function removeRow(key) {
  rows.value = rows.value.filter((r) => r.key !== key);
}

function clearAll() {
  rows.value = [];
}

// Baris valid = punya tanggal & jam masuk. Simpan hanya aktif bila semua valid.
const invalidCount = computed(
  () => rows.value.filter((r) => !r.date || !r.checkIn).length,
);
const canSubmit = computed(
  () => !submitting.value && rows.value.length > 0 && invalidCount.value === 0,
);

async function submit() {
  if (!canSubmit.value) return;
  const saved = await saveBulk(
    rows.value.map((r) => ({
      employeeId: r.employeeId,
      date: r.date,
      checkIn: r.checkIn,
      checkOut: r.checkOut || null,
      note: r.note,
    })),
  );
  if (saved) clearAll();
}

// ── Helper ──────────────────────────────────────────────────────────────────
function toDateInput(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Panel tambah batch -->
    <div class="rounded-2xl border border-mahir-border bg-white p-5">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary">
            <UsersIcon class="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 class="font-semibold text-slate-900">Tambah Kehadiran Massal</h3>
            <p class="text-[12.5px] text-mahir-muted">
              Pilih karyawan, tanggal, dan jam — lalu tambahkan ke daftar. Jam bisa diubah per baris.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex flex-none items-center gap-1.5 rounded-lg border border-mahir-border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="importOpen = true"
        >
          <DocumentArrowUpIcon class="h-4 w-4" /> Impor dari Berkas
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div class="md:col-span-5">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Karyawan <span class="text-mahir-danger">*</span>
          </label>
          <SearchableSelect
            v-model="pickedIds"
            :selected="pickedEmployees"
            :options="options"
            :loading="loading"
            multiple
            placeholder="Pilih karyawan…"
            search-placeholder="Cari nama karyawan…"
            @search="setSearch"
          />
        </div>
        <div class="md:col-span-3">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Tanggal <span class="text-mahir-danger">*</span>
          </label>
          <input
            v-model="formDate"
            type="date"
            :max="todayStr"
            class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Jam Masuk <span class="text-mahir-danger">*</span>
          </label>
          <input
            v-model="formCheckIn"
            type="time"
            class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Jam Keluar
          </label>
          <input
            v-model="formCheckOut"
            type="time"
            class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90"
          @click="addRows"
        >
          <PlusIcon class="h-4 w-4" /> Tambah ke daftar
        </button>
      </div>
    </div>

    <!-- Daftar baris -->
    <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-mahir-border px-5 py-4">
        <h3 class="font-semibold text-slate-900">
          Daftar Kehadiran
          <span class="ml-1 text-sm font-normal text-mahir-muted">({{ rows.length }} baris)</span>
        </h3>
        <div class="flex items-center gap-2">
          <button
            v-if="rows.length"
            type="button"
            class="rounded-lg border border-mahir-border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            :disabled="submitting"
            @click="clearAll"
          >
            Kosongkan
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canSubmit"
            @click="submit"
          >
            <ArrowPathIcon v-if="submitting" class="h-4 w-4 animate-spin" />
            {{ submitting ? "Menyimpan…" : `Simpan Semua (${rows.length})` }}
          </button>
        </div>
      </div>

      <div v-if="!rows.length" class="px-5 py-16 text-center">
        <p class="text-sm text-mahir-muted">
          Belum ada baris. Pilih karyawan & tanggal di atas lalu klik “Tambah ke daftar”.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-mahir-border text-left text-[12.5px] text-mahir-muted">
              <th class="px-5 py-2.5 font-semibold">Karyawan</th>
              <th class="px-3 py-2.5 font-semibold">Tanggal</th>
              <th class="px-3 py-2.5 font-semibold">Masuk</th>
              <th class="px-3 py-2.5 font-semibold">Keluar</th>
              <th class="px-3 py-2.5 font-semibold">Catatan</th>
              <th class="px-5 py-2.5 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows"
              :key="r.key"
              class="border-b border-mahir-border/60 last:border-0"
            >
              <td class="px-5 py-2.5 font-medium text-slate-800">{{ r.employeeName }}</td>
              <td class="px-3 py-2.5">
                <input
                  v-model="r.date"
                  type="date"
                  :max="todayStr"
                  class="w-[150px] rounded-lg border px-2.5 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                  :class="r.date ? 'border-mahir-border' : 'border-mahir-danger'"
                />
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model="r.checkIn"
                  type="time"
                  class="w-[110px] rounded-lg border px-2.5 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                  :class="r.checkIn ? 'border-mahir-border' : 'border-mahir-danger'"
                />
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model="r.checkOut"
                  type="time"
                  class="w-[110px] rounded-lg border border-mahir-border px-2.5 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                />
              </td>
              <td class="px-3 py-2.5">
                <input
                  v-model="r.note"
                  type="text"
                  placeholder="opsional"
                  class="w-full min-w-[140px] rounded-lg border border-mahir-border px-2.5 py-1.5 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                />
              </td>
              <td class="px-5 py-2.5 text-right">
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-mahir-danger"
                  title="Hapus baris"
                  @click="removeRow(r.key)"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        v-if="rows.length && invalidCount"
        class="border-t border-mahir-border px-5 py-3 text-[12.5px] font-medium text-mahir-danger"
      >
        {{ invalidCount }} baris belum lengkap (tanggal & jam masuk wajib diisi).
      </p>
      <p
        v-else-if="rows.length"
        class="border-t border-mahir-border px-5 py-3 text-[11.5px] text-slate-400"
      >
        Jam keluar lebih awal dari jam masuk dianggap hari berikutnya (lintas hari).
      </p>
    </div>

    <!-- Modal impor berkas (CSV/XLSX) -->
    <ImportAttendanceModal v-model:open="importOpen" />
  </div>
</template>
