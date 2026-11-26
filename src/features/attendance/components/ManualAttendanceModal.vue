<script setup>
// Modal set/edit kehadiran manual: admin/atasan mengisi jam masuk & keluar
// seorang karyawan untuk satu tanggal. Form terisi awal dari baris kehadiran
// (tanggal + jam aktual bila ada). checkIn wajib, checkOut opsional.
import { ref, computed, watch } from "vue";
import {
  XMarkIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/vue/24/outline";
import { useManualAttendance } from "../composables/useManualAttendance";

const props = defineProps({
  open: { type: Boolean, default: false },
  // Karyawan konteks (dipakai saat menambah tanggal baru / sebagai fallback id & nama).
  employee: { type: Object, default: null },
  // Baris kehadiran yang diedit (berisi employee, date, logs). Nullable =
  // mode tambah (form kosong).
  record: { type: Object, default: null },
  // Tanggal awal saat mode tambah (record=null), mis. "YYYY-MM-DD" dari sel
  // kalender yang diklik. Kosong → default hari ini.
  defaultDate: { type: String, default: "" },
});
const emit = defineEmits(["update:open", "saved"]);

const { save, submitting } = useManualAttendance();

const date = ref("");
const checkIn = ref("");
const checkOut = ref("");
const note = ref("");
const error = ref("");

// Id & nama karyawan: dari baris yang diedit, atau fallback ke karyawan konteks.
const employeeId = computed(
  () => props.record?.employee?.id ?? props.employee?.id ?? null,
);
const employeeName = computed(
  () =>
    props.record?.employee?.fullName ||
    props.employee?.fullName ||
    (employeeId.value != null ? `#${employeeId.value}` : "—"),
);

// Batas tanggal: tidak boleh melewati hari ini (backend menolak tanggal mendatang).
const todayStr = computed(() => toDateInput(new Date()));

// ── Helper konversi nilai baris → input form ─────────────────────────────
// Nilai tanggal (ISO / Date / "YYYY-MM-DD") → "YYYY-MM-DD" (lokal).
function toDateInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Timestamp → "HH:MM" (jam lokal). Kosong bila invalid.
function toHHMM(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Arah log dari attendanceType ("...OUT..." → keluar, "...IN..." → masuk).
function logDir(type) {
  const t = String(type ?? "").toLowerCase();
  if (t.includes("out")) return "out";
  if (t.includes("in")) return "in";
  return "other";
}

// Jam masuk aktual = log "masuk" paling awal; keluar = log "keluar" paling akhir.
function deriveTimes(row) {
  const logs = [...(row?.logs ?? [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const ins = logs.filter((l) => logDir(l.attendanceType) === "in");
  const outs = logs.filter((l) => logDir(l.attendanceType) === "out");
  return {
    in: ins.length ? toHHMM(ins[0].timestamp) : "",
    out: outs.length ? toHHMM(outs[outs.length - 1].timestamp) : "",
  };
}

// Isi form dari baris saat modal dibuka.
function prefill() {
  error.value = "";
  const row = props.record;
  if (row) {
    // Mode edit: tanggal & jam aktual dari baris.
    date.value = toDateInput(row.date) || todayStr.value;
    const times = deriveTimes(row);
    checkIn.value = times.in;
    checkOut.value = times.out;
  } else {
    // Mode tambah: tanggal dari sel kalender (bila ada) atau hari ini; jam kosong.
    date.value = toDateInput(props.defaultDate) || todayStr.value;
    checkIn.value = "";
    checkOut.value = "";
  }
  note.value = "";
}

watch(
  () => props.open,
  (open) => {
    if (open) prefill();
  },
);

const canSubmit = computed(
  () => !submitting.value && !!date.value && !!checkIn.value && employeeId.value != null,
);

function close() {
  if (submitting.value) return;
  emit("update:open", false);
}

async function onSubmit() {
  error.value = "";
  if (!date.value || !checkIn.value) {
    error.value = "Tanggal dan jam masuk wajib diisi.";
    return;
  }
  const saved = await save({
    employeeId: employeeId.value,
    date: date.value,
    checkIn: checkIn.value,
    checkOut: checkOut.value || null,
    note: note.value,
  });
  if (saved) {
    emit("saved", saved);
    emit("update:open", false);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div class="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-mahir-border px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
                <PencilSquareIcon class="h-5 w-5" />
              </span>
              <div>
                <h5 class="text-lg font-bold text-slate-900">Kehadiran Manual</h5>
                <p class="text-[12px] text-mahir-muted">{{ employeeName }}</p>
              </div>
            </div>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-50"
              :disabled="submitting"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-4 px-6 py-5">
            <!-- Tanggal -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Tanggal <span class="text-mahir-danger">*</span>
              </label>
              <input
                v-model="date"
                type="date"
                :max="todayStr"
                class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
              />
            </div>

            <!-- Jam masuk & keluar -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">
                  Jam Masuk <span class="text-mahir-danger">*</span>
                </label>
                <input
                  v-model="checkIn"
                  type="time"
                  class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">
                  Jam Keluar <span class="text-slate-400">(opsional)</span>
                </label>
                <input
                  v-model="checkOut"
                  type="time"
                  class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                />
              </div>
            </div>
            <p class="-mt-2 text-[11.5px] text-slate-400">
              Jam keluar lebih awal dari jam masuk dianggap hari berikutnya (lintas hari).
            </p>

            <!-- Catatan -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Catatan <span class="text-slate-400">(opsional)</span>
              </label>
              <textarea
                v-model="note"
                rows="2"
                placeholder="Mis. koreksi lupa absen, dinas luar, dll."
                class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
              ></textarea>
            </div>

            <p v-if="error" class="text-[13px] font-medium text-mahir-danger">{{ error }}</p>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 border-t border-mahir-border px-6 py-4">
            <button
              type="button"
              class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              :disabled="submitting"
              @click="close"
            >
              Batal
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canSubmit"
              @click="onSubmit"
            >
              <ArrowPathIcon v-if="submitting" class="h-4 w-4 animate-spin" />
              {{ submitting ? "Menyimpan…" : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
