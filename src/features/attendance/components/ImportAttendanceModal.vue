<script setup>
// Modal impor kehadiran manual dari berkas (CSV/XLSX) via importManualAttendance.
// Admin/HRD mengunggah berkas sesuai template; backend memproses async & mengirim
// hasil (sukses/galat per baris) ke email tujuan. Respons hanya metadata antrean.
import { ref, computed, watch } from "vue";
import {
  XMarkIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
} from "@heroicons/vue/24/outline";
import { useImportManualAttendance } from "../composables/useImportManualAttendance";
// Berkas contoh/template (dibundel Vite sebagai URL unduhan).
import csvTemplateUrl from "@/assets/attendance_import_example.csv?url";
import xlsxTemplateUrl from "@/assets/attendance_import_example.xlsx?url";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "imported"]);

const { importFile, submitting } = useImportManualAttendance();

const file = ref(null);
const notifyEmail = ref("");
const error = ref("");
const fileInput = ref(null);

const fileName = computed(() => file.value?.name ?? "");
const canSubmit = computed(
  () => !submitting.value && !!file.value && !!notifyEmail.value.trim(),
);

watch(
  () => props.open,
  (open) => {
    if (open) {
      error.value = "";
      file.value = null;
      notifyEmail.value = "";
      if (fileInput.value) fileInput.value.value = "";
    }
  },
);

const ACCEPT = ".csv,.xlsx";
const ALLOWED = /\.(csv|xlsx)$/i;

function pickFile(e) {
  error.value = "";
  const f = e.target.files?.[0] ?? null;
  if (f && !ALLOWED.test(f.name)) {
    error.value = "Format berkas harus .csv atau .xlsx.";
    file.value = null;
    return;
  }
  file.value = f;
}

function close() {
  if (submitting.value) return;
  emit("update:open", false);
}

async function onSubmit() {
  error.value = "";
  if (!file.value) {
    error.value = "Pilih berkas yang akan diimpor.";
    return;
  }
  if (!notifyEmail.value.trim()) {
    error.value = "Email tujuan hasil impor wajib diisi.";
    return;
  }
  const result = await importFile({
    file: file.value,
    notifyEmail: notifyEmail.value,
  });
  if (result) {
    emit("imported", result);
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
        <div class="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-mahir-border px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
                <DocumentArrowUpIcon class="h-5 w-5" />
              </span>
              <div>
                <h5 class="text-lg font-bold text-slate-900">Impor Kehadiran</h5>
                <p class="text-[12px] text-mahir-muted">Unggah berkas CSV/XLSX sesuai template</p>
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
            <!-- Template & format -->
            <div class="rounded-xl border border-mahir-border bg-slate-50/60 p-4">
              <p class="mb-2 text-[13px] font-semibold text-slate-700">Unduh template</p>
              <div class="flex flex-wrap gap-2">
                <a
                  :href="csvTemplateUrl"
                  download="attendance_import_example.csv"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ArrowDownTrayIcon class="h-4 w-4" /> Contoh CSV
                </a>
                <a
                  :href="xlsxTemplateUrl"
                  download="attendance_import_example.xlsx"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ArrowDownTrayIcon class="h-4 w-4" /> Contoh XLSX
                </a>
              </div>
              <p class="mt-3 text-[11.5px] leading-relaxed text-slate-500">
                Kolom:
                <code class="rounded bg-white px-1 text-slate-700">employee_id</code>,
                <code class="rounded bg-white px-1 text-slate-700">employee_code</code>,
                <code class="rounded bg-white px-1 text-slate-700">date</code> (YYYY-MM-DD),
                <code class="rounded bg-white px-1 text-slate-700">check_in</code>,
                <code class="rounded bg-white px-1 text-slate-700">check_out</code>,
                <code class="rounded bg-white px-1 text-slate-700">note</code>.
                Isi salah satu dari employee_id / employee_code; check_out opsional.
              </p>
            </div>

            <!-- Pilih berkas -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Berkas <span class="text-mahir-danger">*</span>
              </label>
              <label
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-mahir-border px-4 py-3 text-sm hover:border-mahir-primary/60"
              >
                <span class="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary">
                  <ArrowUpTrayIcon class="h-4.5 w-4.5" />
                </span>
                <span class="min-w-0 flex-1">
                  <span v-if="fileName" class="block truncate font-medium text-slate-800">{{ fileName }}</span>
                  <span v-else class="block text-slate-500">Klik untuk memilih berkas .csv / .xlsx</span>
                </span>
                <input
                  ref="fileInput"
                  type="file"
                  :accept="ACCEPT"
                  class="hidden"
                  @change="pickFile"
                />
              </label>
            </div>

            <!-- Email tujuan -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Kirim hasil ke email <span class="text-mahir-danger">*</span>
              </label>
              <input
                v-model="notifyEmail"
                type="email"
                placeholder="nama@perusahaan.com"
                class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
              />
              <p class="mt-1 text-[11.5px] text-slate-400">
                Impor diproses di latar belakang; ringkasan hasil (berhasil/gagal per baris) dikirim ke email ini.
              </p>
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
              {{ submitting ? "Mengunggah…" : "Impor" }}
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
