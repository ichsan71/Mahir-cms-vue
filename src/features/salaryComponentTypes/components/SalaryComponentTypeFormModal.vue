<script setup>
// Form tambah/ubah komponen penggajian — kontrak SalaryComponentTypeInput.
// Semua field sudah tersedia di LIST query, jadi prefill langsung dari baris list.
import { ref, computed, watch } from "vue";
import BaseModal from "@/shared/components/BaseModal.vue";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";

// Pilihan kategori dari enum backend SALARY_COMPONENT_CATEGORY.
// options => [{ value, label }]; value yang dikirim = nama enum (mis. "BASIC").
const { options: categoryOptions } = useEnumChoices("SALARY_COMPONENT_CATEGORY");

// Angka acak 4 digit (0000–9999).
function randomNum(digits = 4) {
  return String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, "0");
}

// Inisial tiap kata (maks 4 huruf), mis. "Gaji Pokok" => "GP".
function toInitials(name) {
  const clean = String(name || "")
    .normalize("NFKD")
    .replace(/[^\w\s]+/g, "")
    .trim();
  if (!clean) return "";
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

const props = defineProps({
  open: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Komponen yang sedang diubah (baris list). null = mode tambah.
  componentType: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "save"]);

const isEdit = computed(() => !!props.componentType?.id);

const blank = () => ({
  name: "",
  code: "",
  category: "",
  isTaxable: false,
  isFixed: false,
  isProrated: false,
  forfeitIfLateMinutes: "",
  isActive: true,
});

const form = ref(blank());

// Angka acak 4 digit, dikunci sekali tiap kali modal tambah dibuka agar tidak
// berganti-ganti saat mengetik nama; hanya inisial yang mengikuti nama.
const codeSuffix = ref(randomNum());

function fillForm() {
  const s = props.componentType;
  if (!s?.id) codeSuffix.value = randomNum();
  form.value = s?.id
    ? {
        name: s.name ?? "",
        code: s.code ?? "",
        category: s.category ?? "",
        isTaxable: !!s.isTaxable,
        isFixed: !!s.isFixed,
        isProrated: !!s.isProrated,
        forfeitIfLateMinutes: s.forfeitIfLateMinutes ?? "",
        isActive: s.isActive ?? true,
      }
    : blank();
}

watch(() => props.open, (open) => open && fillForm());
watch(() => props.componentType, () => props.open && fillForm());

// Kode auto dari nama HANYA saat tambah (read-only di UI): inisial nama + angka
// acak 4 digit yang terkunci. mis. "Gaji Pokok" => "GP4172". Saat edit, kode lama
// dipertahankan dan tidak bisa diubah.
watch(() => form.value.name, (name) => {
  if (isEdit.value) return;
  const initials = toInitials(name);
  form.value.code = initials ? `${initials}${codeSuffix.value}` : "";
});

function onSubmit() {
  const f = form.value;
  const forfeit = f.forfeitIfLateMinutes === "" || f.forfeitIfLateMinutes === null
    ? null
    : Number(f.forfeitIfLateMinutes);
  const input = {
    name: f.name?.trim() || null,
    code: f.code?.trim() || null,
    category: f.category || null,
    isTaxable: !!f.isTaxable,
    isFixed: !!f.isFixed,
    isProrated: !!f.isProrated,
    forfeitIfLateMinutes: forfeit,
    isActive: !!f.isActive,
  };
  emit("save", { id: props.componentType?.id ?? null, input });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
const toggleCls = "flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3";
</script>

<template>
  <BaseModal
    :open="open"
    :title="isEdit ? 'Edit Komponen Penggajian' : 'Tambah Komponen Penggajian'"
    size="2xl"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="onSubmit"
  >
    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Kolom kiri: isian form -->
      <div class="space-y-4 lg:col-span-2">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Nama Komponen *</label>
          <input v-model="form.name" type="text" required :class="fieldCls" placeholder="mis. Gaji Pokok" />
        </div>
        <div>
          <label :class="labelCls">Kode *</label>
          <input
            v-model="form.code"
            type="text"
            required
            readonly
            :class="[fieldCls, 'cursor-not-allowed bg-slate-50 text-slate-500']"
            placeholder="Otomatis dari nama"
          />
          <span class="mt-1 block text-[12px] text-mahir-muted">Dibuat otomatis dari nama komponen.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label :class="labelCls">Kategori *</label>
          <select v-model="form.category" required :class="fieldCls">
            <option value="" disabled>Pilih kategori</option>
            <option v-for="c in categoryOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div>
          <label :class="labelCls">Hangus bila telat (menit)</label>
          <input
            v-model="form.forfeitIfLateMinutes"
            type="number"
            min="0"
            :class="fieldCls"
            placeholder="Kosongkan bila tidak berlaku"
          />
          <span class="mt-1 block text-[12px] text-mahir-muted">Untuk komponen harian: hari dengan telat melebihi menit ini tidak dibayar.</span>
        </div>
      </div>

      <div>
        <label :class="labelCls">Sifat komponen</label>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label :class="toggleCls">
            <input v-model="form.isTaxable" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
            <span>
              <span class="block text-sm font-medium text-slate-700">Kena pajak</span>
              <span class="block text-[12px] text-mahir-muted">Komponen ini dihitung sebagai objek pajak.</span>
            </span>
          </label>

          <label :class="toggleCls">
            <input v-model="form.isFixed" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
            <span>
              <span class="block text-sm font-medium text-slate-700">Tetap</span>
              <span class="block text-[12px] text-mahir-muted">Dibayar penuh tiap periode. Jika tidak dicentang, dihitung per hari hadir.</span>
            </span>
          </label>

          <label :class="toggleCls">
            <input v-model="form.isProrated" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
            <span>
              <span class="block text-sm font-medium text-slate-700">Prorata</span>
              <span class="block text-[12px] text-mahir-muted">Dipotong proporsional dengan hari tidak hadir. Hanya untuk komponen Tetap.</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Status aktif: saklar untuk menghidupkan/menonaktifkan komponen ini. -->
      <div>
        <label :class="labelCls">Status komponen</label>
        <div
          class="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors"
          :class="form.isActive ? 'border-emerald-200 bg-emerald-50/60' : 'border-mahir-border bg-slate-50'"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-2.5 w-2.5 rounded-full"
              :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-400'"
            />
            <span>
              <span class="block text-sm font-semibold" :class="form.isActive ? 'text-emerald-700' : 'text-slate-600'">
                {{ form.isActive ? "Aktif" : "Nonaktif" }}
              </span>
              <span class="block text-[12px] text-mahir-muted">
                {{
                  form.isActive
                    ? "Komponen aktif dan dapat dipakai pada struktur gaji."
                    : "Komponen dimatikan — tidak bisa dipilih pada struktur gaji."
                }}
              </span>
            </span>
          </div>

          <button
            type="button"
            role="switch"
            :aria-checked="form.isActive"
            aria-label="Aktifkan komponen penggajian"
            @click="form.isActive = !form.isActive"
            class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-mahir-primary focus:ring-offset-2"
            :class="form.isActive ? 'bg-emerald-500' : 'bg-slate-300'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
              :class="form.isActive ? 'translate-x-[22px]' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>
      </div>
      <!-- /Kolom kiri -->

      <!-- Kolom kanan: panduan sifat komponen + contoh kasus (bisa dibuka) -->
      <aside class="lg:col-span-1">
        <div class="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-[12px] leading-relaxed text-slate-600 lg:sticky lg:top-0">
          <h6 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-sky-800">
            <svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
            </svg>
            Panduan sifat komponen
          </h6>

          <ul class="space-y-1.5">
            <li><b class="text-slate-700">Tetap</b> — dibayar penuh tiap periode. Jika tidak, dihitung per hari hadir × nilai harian.</li>
            <li><b class="text-slate-700">Prorata</b> — nilai dipotong proporsional dengan hari tidak hadir (khusus komponen Tetap).</li>
            <li><b class="text-slate-700">Hangus bila telat</b> — hari yang telat melebihi batas menit tidak dibayar (khusus komponen harian).</li>
          </ul>

          <details class="mt-3 rounded-lg border border-sky-200 bg-white/70">
            <summary class="cursor-pointer select-none px-3 py-2 font-medium text-sky-800">
              Lihat contoh kasus &amp; perhitungan
            </summary>

            <div class="space-y-3 border-t border-sky-200 px-3 py-3">
              <div class="overflow-x-auto">
                <p class="mb-1 font-medium text-slate-700">Pengaturan (asumsi 22 hari kerja):</p>
                <table class="w-full border-collapse text-[11px]">
                  <thead>
                    <tr class="bg-sky-100/60 text-left text-slate-600">
                      <th class="border border-sky-200 px-2 py-1 font-medium">Komponen</th>
                      <th class="border border-sky-200 px-2 py-1 font-medium">Tetap</th>
                      <th class="border border-sky-200 px-2 py-1 font-medium">Prorata</th>
                      <th class="border border-sky-200 px-2 py-1 font-medium">Hangus</th>
                      <th class="border border-sky-200 px-2 py-1 font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody class="text-slate-600">
                    <tr>
                      <td class="border border-sky-200 px-2 py-1">Gaji Pokok</td>
                      <td class="border border-sky-200 px-2 py-1">Ya</td>
                      <td class="border border-sky-200 px-2 py-1">Ya</td>
                      <td class="border border-sky-200 px-2 py-1">—</td>
                      <td class="border border-sky-200 px-2 py-1">5.000.000</td>
                    </tr>
                    <tr>
                      <td class="border border-sky-200 px-2 py-1">Transport</td>
                      <td class="border border-sky-200 px-2 py-1">Ya</td>
                      <td class="border border-sky-200 px-2 py-1">Ya</td>
                      <td class="border border-sky-200 px-2 py-1">—</td>
                      <td class="border border-sky-200 px-2 py-1">500.000</td>
                    </tr>
                    <tr>
                      <td class="border border-sky-200 px-2 py-1">Uang Makan</td>
                      <td class="border border-sky-200 px-2 py-1">Tidak</td>
                      <td class="border border-sky-200 px-2 py-1">—</td>
                      <td class="border border-sky-200 px-2 py-1">30</td>
                      <td class="border border-sky-200 px-2 py-1">10rb/hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p class="mb-1 font-medium text-slate-700">Perhitungan (1 absen, 1 telat, 1 cuti tahunan):</p>
                <ul class="space-y-1">
                  <li><b class="text-slate-700">Gaji Pokok</b>: 5.000.000 − (5.000.000 ÷ 22 × 1) = <b>4.772.727</b></li>
                  <li><b class="text-slate-700">Transport</b>: 500.000 − (500.000 ÷ 22 × 2) = <b>454.545</b> <span class="text-mahir-muted">(absen + cuti, karena cuti tahunan tidak dibayar)</span></li>
                  <li><b class="text-slate-700">Uang Makan</b>: (20 hadir − 1 telat + 1 cuti) = 20 × 10.000 = <b>200.000</b></li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </aside>
    </div>
  </BaseModal>
</template>
