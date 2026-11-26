<script setup>
// Modal impor karyawan massal dari berkas (CSV/XLSX) via bulkImportEmployee.
// Admin/HRD mengunggah berkas sesuai template; backend memproses async & mengirim
// hasil (sukses/galat per baris) ke email tujuan. Respons hanya metadata antrean.
//
// Panel "Daftar Kode Referensi" menampilkan pemetaan id → nama (cabang/level/dll)
// yang diambil langsung dari backend, agar pengisi CSV tahu id yang valid tanpa
// menebak. Data selalu fresh (bukan file statis). Lihat useEmployeeImportReference.
import { ref, computed, watch } from "vue";
import {
  XMarkIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  UserPlusIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
} from "@heroicons/vue/24/outline";
import { useImportEmployee } from "../composables/useImportEmployee";
import { useEmployeeImportReference } from "../composables/useEmployeeImportReference";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "imported"]);

const { importFile, submitting, requestTemplate, requestingTemplate } = useImportEmployee();

const file = ref(null);
const notifyEmail = ref("");
const error = ref("");
const fileInput = ref(null);

const fileName = computed(() => file.value?.name ?? "");
const canSubmit = computed(
  () => !submitting.value && !!file.value && !!notifyEmail.value.trim(),
);

// ── Panel referensi id → nama (kolom kanan modal) ──────────────────────────
const openSection = ref(""); // dimensi yang sedang diperluas
const refSearch = ref(""); // kotak cari di dalam dimensi yang terbuka

// Dimensi id (cabang/level/dll/atasan) dicari server-side: ambil 10 teratas lalu
// cari via backend. `refSearch` di-debounce agar tak nembak tiap ketukan.
const serverSearch = ref("");
let searchTimer = null;
watch(refSearch, (v) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    serverSearch.value = v;
  }, 350);
});

// Lazy-load per dimensi: query cuma jalan saat modal terbuka & dimensi itu dibuka.
const reference = useEmployeeImportReference(
  () => props.open,
  () => openSection.value,
  () => serverSearch.value,
);

// Konfigurasi tiap dimensi: kolom CSV + sumber baris {id, name}.
// Dimensi id memakai header ID|Nama & pencarian server (`server: true`);
// enum memakai Tampilan|Kode dan disaring di klien (daftarnya kecil).
const sections = computed(() => [
  { key: "branch", title: "Cabang", column: "branch_id", idLabel: "ID", nameLabel: "Nama", rows: reference.branches.value, server: true },
  { key: "level", title: "Level / Jabatan", column: "level_id", idLabel: "ID", nameLabel: "Nama", rows: reference.levels.value, server: true },
  { key: "employment", title: "Tipe Kepegawaian", column: "employment_type_id", idLabel: "ID", nameLabel: "Nama", rows: reference.employmentTypes.value, server: true },
  { key: "workPattern", title: "Pola Kerja", column: "work_pattern_id", idLabel: "ID", nameLabel: "Nama", rows: reference.workPatterns.value, server: true },
  { key: "company", title: "Perusahaan", column: "companies_ids", idLabel: "ID", nameLabel: "Nama", rows: reference.companies.value, server: true },
  { key: "unit", title: "Unit", column: "units_ids", idLabel: "ID", nameLabel: "Nama", rows: reference.units.value, server: true },
  { key: "employee", title: "Atasan (Karyawan)", column: "parent_id", idLabel: "ID", nameLabel: "Nama", rows: reference.employees.value, server: true },
  {
    key: "religion",
    title: "Agama",
    column: "religion",
    idLabel: "Tampilan",
    nameLabel: "Kode",
    rows: reference.religions.value.map((o) => ({ id: o.label, name: o.value })),
  },
  {
    key: "marital",
    title: "Status Pernikahan",
    column: "marital_status",
    idLabel: "Tampilan",
    nameLabel: "Kode",
    rows: reference.maritalStatuses.value.map((o) => ({ id: o.label, name: o.value })),
  },
]);

function toggleSection(key) {
  openSection.value = openSection.value === key ? "" : key;
  clearTimeout(searchTimer);
  refSearch.value = "";
  serverSearch.value = "";
}

// Minta template impor dikirim ke email tujuan (notifyEmail) via backend.
async function onRequestTemplate() {
  error.value = "";
  if (!notifyEmail.value.trim()) {
    error.value = "Isi email tujuan dulu untuk menerima template.";
    return;
  }
  await requestTemplate(notifyEmail.value);
}

// Dimensi server-side (karyawan) sudah difilter backend → tampilkan apa adanya.
// Dimensi katalog disaring di klien dari kotak cari.
function filteredRows(section) {
  if (section.server) return section.rows;
  const q = refSearch.value.trim().toLowerCase();
  if (!q) return section.rows;
  return section.rows.filter(
    (r) =>
      String(r.id).toLowerCase().includes(q) ||
      String(r.name ?? "").toLowerCase().includes(q),
  );
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      error.value = "";
      file.value = null;
      notifyEmail.value = "";
      openSection.value = "";
      clearTimeout(searchTimer);
      refSearch.value = "";
      serverSearch.value = "";
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
        <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-mahir-border px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
                <UserPlusIcon class="h-5 w-5" />
              </span>
              <div>
                <h5 class="text-lg font-bold text-slate-900">Impor Karyawan</h5>
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

          <!-- Body: dua kolom — kiri form, kanan referensi id -->
          <div class="flex min-h-0 flex-1 flex-col md:flex-row">
            <!-- Kolom kiri: alur 2 langkah dengan SATU email -->
            <div class="flex flex-col gap-5 overflow-y-auto px-6 py-5 md:w-[48%] md:flex-none">
              <!-- Email tujuan (satu kali, dipakai untuk template & hasil impor) -->
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700">
                  Email tujuan <span class="text-mahir-danger">*</span>
                </label>
                <input
                  v-model="notifyEmail"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  class="w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                />
                <p class="mt-1 text-[11.5px] text-slate-400">
                  Satu email untuk kedua langkah: menerima template & ringkasan hasil impor.
                </p>
              </div>

              <!-- Langkah 1: minta template -->
              <div class="flex gap-3">
                <span class="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-mahir-primary text-[12px] font-bold text-white">1</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-semibold text-slate-800">Dapatkan template</p>
                  <p class="mb-2 text-[11.5px] text-slate-500">Template dikirim ke email di atas, lalu isi datanya.</p>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-mahir-border bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="requestingTemplate || !notifyEmail.trim()"
                    @click="onRequestTemplate"
                  >
                    <ArrowPathIcon v-if="requestingTemplate" class="h-4 w-4 animate-spin" />
                    <ArrowDownTrayIcon v-else class="h-4 w-4" />
                    {{ requestingTemplate ? "Mengirim…" : "Kirim template ke email" }}
                  </button>
                  <p class="mt-2 text-[11.5px] leading-relaxed text-slate-500">
                    Kolom bertanda <span class="font-medium text-slate-600">_id</span> diisi angka id — lihat
                    <span class="font-medium text-slate-600">Daftar Kode Referensi</span> di samping.
                    <code class="rounded bg-slate-100 px-1 text-slate-700">parent_id</code> = id karyawan atasan;
                    <code class="rounded bg-slate-100 px-1 text-slate-700">companies_ids</code> &amp;
                    <code class="rounded bg-slate-100 px-1 text-slate-700">units_ids</code> boleh banyak, dipisah
                    tanda titik koma (<code class="rounded bg-slate-100 px-1 text-slate-700">;</code>).
                    Tanggal <code class="rounded bg-slate-100 px-1 text-slate-700">YYYY-MM-DD</code>.
                    <code class="rounded bg-slate-100 px-1 text-slate-700">citizenship</code> teks bebas (mis. WNI).
                  </p>
                </div>
              </div>

              <!-- Langkah 2: unggah berkas hasil isian -->
              <div class="flex gap-3">
                <span class="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-mahir-primary text-[12px] font-bold text-white">2</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-semibold text-slate-800">Unggah berkas hasil isian <span class="text-mahir-danger">*</span></p>
                  <p class="mb-2 text-[11.5px] text-slate-500">Setelah template diisi, unggah kembali di sini.</p>
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-mahir-border px-4 py-3 text-sm hover:border-mahir-primary/60"
                  >
                    <span class="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-mahir-primary-soft text-mahir-primary">
                      <ArrowUpTrayIcon class="h-5 w-5" />
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
              </div>

              <p v-if="error" class="text-[13px] font-medium text-mahir-danger">{{ error }}</p>
            </div>

            <!-- Kolom kanan: Daftar Kode Referensi (id → nama dari backend) -->
            <div class="flex min-h-0 flex-1 flex-col border-t border-mahir-border bg-slate-50/50 md:border-l md:border-t-0">
              <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-3">
                <TableCellsIcon class="h-5 w-5 flex-none text-mahir-primary" />
                <span class="text-[13px] font-semibold text-slate-700">Daftar Kode Referensi</span>
                <span v-if="reference.loading.value" class="text-[11px] text-slate-400">memuat…</span>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <p class="mb-2 px-1 text-[11.5px] leading-relaxed text-slate-500">
                  Klik dimensi untuk melihat id &amp; namanya, lalu salin id ke kolom CSV terkait.
                  Data diambil langsung dari sistem (selalu terbaru).
                </p>

                <div class="flex flex-col gap-1.5">
                  <div
                    v-for="s in sections"
                    :key="s.key"
                    class="overflow-hidden rounded-lg border border-mahir-border bg-white"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                      @click="toggleSection(s.key)"
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        <ChevronRightIcon
                          class="h-3.5 w-3.5 flex-none text-slate-400 transition-transform"
                          :class="openSection === s.key ? 'rotate-90' : ''"
                        />
                        <span class="truncate text-[13px] font-medium text-slate-700">{{ s.title }}</span>
                        <code class="hidden rounded bg-slate-100 px-1 text-[11px] text-slate-500 sm:inline">{{ s.column }}</code>
                      </span>
                      <span v-if="!s.server" class="flex-none text-[11px] text-slate-400">{{ s.rows.length }}</span>
                    </button>

                    <div v-if="openSection === s.key" class="border-t border-mahir-border px-3 pb-3 pt-2">
                      <!-- Pencarian dimensi: server untuk dimensi id, klien untuk enum -->
                      <div class="relative mb-2">
                        <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          v-model="refSearch"
                          type="text"
                          :placeholder="s.server ? 'Cari nama…' : 'Cari id atau nama…'"
                          class="w-full rounded-md border border-mahir-border py-1.5 pl-8 pr-2 text-[12.5px] focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary"
                        />
                      </div>

                      <div class="max-h-52 overflow-y-auto rounded-md border border-mahir-border">
                        <table class="w-full text-left text-[12.5px]">
                          <thead class="sticky top-0 bg-slate-100 text-slate-500">
                            <tr>
                              <th class="w-16 px-3 py-1.5 font-semibold">{{ s.idLabel }}</th>
                              <th class="px-3 py-1.5 font-semibold">{{ s.nameLabel }}</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-mahir-border">
                            <tr v-for="r in filteredRows(s)" :key="String(r.id)" class="hover:bg-slate-50">
                              <td class="px-3 py-1.5 font-mono text-slate-700">{{ r.id }}</td>
                              <td class="px-3 py-1.5 text-slate-700">{{ r.name || "—" }}</td>
                            </tr>
                            <tr v-if="!filteredRows(s).length">
                              <td colspan="2" class="px-3 py-3 text-center text-[12px] text-slate-400">
                                {{ reference.loading.value ? "Memuat…" : "Tidak ada data." }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p v-if="s.server" class="mt-1.5 px-1 text-[11px] text-slate-400">
                        Menampilkan 10 teratas — ketik untuk mencari karyawan lain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
