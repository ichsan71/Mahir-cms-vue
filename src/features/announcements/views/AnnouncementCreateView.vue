<script setup>
// Halaman buat/ubah pengumuman (create/editAnnouncement). Mode ditentukan oleh
// param rute `:id` — bila ada → mode edit (prefill dari getAnnouncement).
// Field: judul, isi (CKEditor), status (enum), sematkan, jadwal tayang/kedaluwarsa,
// perusahaan & unit (multi-select), serta lampiran (multi-file).
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SearchableSelect from "@/shared/components/SearchableSelect.vue";
import RichTextEditor from "@/shared/components/RichTextEditor.vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useEnumChoices } from "@/shared/composables/useEnumChoices";
import { useCompanySearch } from "@/features/companies/composables/useCompanySearch";
import { useUnitSearch } from "@/features/units/composables/useUnitSearch";
import { useAnnouncementForm } from "../composables/useAnnouncementForm";
import { useAnnouncementDetail } from "../composables/useAnnouncementDetail";
import { PaperClipIcon, XMarkIcon, MegaphoneIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

// Mode edit bila ada param id pada rute.
const editId = computed(() => (route.params.id ? Number(route.params.id) : null));
const isEdit = computed(() => editId.value != null);

// Selector perusahaan & unit (multi).
const { options: companyOptions, loading: companyLoading, setSearch: setCompanySearch } = useCompanySearch();
const { options: unitOptions, loading: unitLoading, setSearch: setUnitSearch } = useUnitSearch();
// Ref stabil untuk prefill SearchableSelect (badge terpilih).
const companySelected = ref([]);
const unitSelected = ref([]);

// Status dari enum backend.
const { options: statusOptions, loading: statusLoading } = useEnumChoices("AnnouncementStatusChoices");

const { createAnnouncement, editAnnouncement, loading: saving } = useAnnouncementForm();

// Data untuk prefill (mode edit).
const { announcement } = useAnnouncementDetail(editId);

const blank = () => ({
  title: "",
  content: "",
  status: "",
  isPinned: false,
  publishedAt: null,
  expiredAt: null,
  companyIds: [],
  unitIds: [],
});

const form = ref(blank());
const attachments = ref([]); // File[] baru yang akan diunggah
const existingAttachments = ref([]); // lampiran yang sudah ada (mode edit, read-only)
const fileInput = ref(null);
const errors = ref({});

function resetForm() {
  form.value = blank();
  attachments.value = [];
  existingAttachments.value = [];
  companySelected.value = [];
  unitSelected.value = [];
  errors.value = {};
}

// Reset saat pindah ke mode buat (rute yang sama dipakai bersama).
watch(editId, (id) => {
  if (id == null) resetForm();
}, { immediate: true });

// Prefill saat data pengumuman (mode edit) tiba.
watch(announcement, (a) => {
  if (!a || !isEdit.value) return;
  form.value = {
    title: a.title ?? "",
    content: a.content ?? "",
    status: a.status ?? "",
    isPinned: !!a.isPinned,
    publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
    expiredAt: a.expiredAt ? new Date(a.expiredAt) : null,
    companyIds: (a.companies || []).map((c) => c.id),
    unitIds: (a.units || []).map((u) => u.id),
  };
  companySelected.value = (a.companies || []).map((c) => ({ id: c.id, name: c.name }));
  unitSelected.value = (a.units || []).map((u) => ({ id: u.id, name: u.name }));
  existingAttachments.value = a.attachments || [];
});

// Samakan nilai status ke value enum yang cocok. Opsi enum kadang termuat setelah
// prefill, dan casing bisa berbeda (mis. "published" vs "PUBLISHED"); tanpa ini
// <select> tidak menampilkan status terpilih saat edit.
watch(
  [statusOptions, () => form.value.status],
  ([opts, cur]) => {
    if (!cur || !opts.length) return;
    const hit = opts.find((o) => String(o.value).toLowerCase() === String(cur).toLowerCase());
    if (hit && hit.value !== cur) form.value.status = hit.value;
  },
  { immediate: true },
);

// Nama berkas dari URL lampiran yang sudah ada.
function existingName(url) {
  if (!url) return "Lampiran";
  try {
    return decodeURIComponent(url.split("/").pop().split("?")[0]) || "Lampiran";
  } catch {
    return "Lampiran";
  }
}

function onFilesChange(e) {
  const picked = Array.from(e.target.files || []);
  // Gabungkan dengan yang sudah ada agar bisa memilih bertahap.
  attachments.value = [...attachments.value, ...picked];
  if (fileInput.value) fileInput.value.value = "";
}
function removeFile(idx) {
  attachments.value = attachments.value.filter((_, i) => i !== idx);
}
function fileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Date → ISO string (untuk publishedAt/expiredAt), null bila kosong.
function toISO(d) {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function validate() {
  const f = form.value;
  const next = {};
  if (!f.title?.trim()) next.title = "Judul wajib diisi.";
  if (!f.status) next.status = "Status wajib dipilih.";
  if (f.publishedAt && f.expiredAt && new Date(f.expiredAt) < new Date(f.publishedAt)) {
    next.expiredAt = "Tanggal kedaluwarsa tidak boleh sebelum tanggal tayang.";
  }
  errors.value = next;
  return Object.keys(next).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const f = form.value;
  const input = {
    title: f.title?.trim() || null,
    content: f.content?.trim() || null,
    status: f.status || null,
    isPinned: !!f.isPinned,
    publishedAt: toISO(f.publishedAt),
    expiredAt: toISO(f.expiredAt),
    companyIds: f.companyIds.length ? f.companyIds.map(Number) : null,
    unitIds: f.unitIds.length ? f.unitIds.map(Number) : null,
    // Hanya berkas BARU yang dikirim. Mode edit menyertakan announcementId.
    attachments: attachments.value.length
      ? attachments.value.map((file) =>
          isEdit.value ? { file, announcementId: editId.value } : { file },
        )
      : null,
  };

  const saved = isEdit.value
    ? await editAnnouncement(editId.value, input)
    : await createAnnouncement(input);

  if (saved) {
    resetForm();
    router.push({ name: "pengumuman" });
  }
}

function onCancel() {
  router.push({ name: "pengumuman" });
}

const fieldCls =
  "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";
</script>

<template>
  <!-- Header -->
  <div class="mb-6 flex items-center gap-3">
    <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
      <MegaphoneIcon class="h-6 w-6" />
    </span>
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ isEdit ? "Ubah Pengumuman" : "Buat Pengumuman" }}</h1>
      <p class="text-sm text-mahir-muted">Tulis pengumuman dan tentukan tujuan perusahaan/unit</p>
    </div>
  </div>

  <form class="grid grid-cols-1 gap-5 lg:grid-cols-3" @submit.prevent="onSubmit">
    <!-- Kolom utama -->
    <div class="flex flex-col gap-4 lg:col-span-2">
      <div class="rounded-2xl border border-mahir-border bg-white p-5">
        <div class="mb-4">
          <label :class="labelCls">Judul *</label>
          <input v-model="form.title" type="text" :class="fieldCls" placeholder="Judul pengumuman" />
          <p v-if="errors.title" class="mt-1 text-xs text-rose-500">{{ errors.title }}</p>
        </div>

        <div>
          <label :class="labelCls">Isi Pengumuman</label>
          <RichTextEditor v-model="form.content" placeholder="Tulis isi pengumuman…" />
        </div>
      </div>

      <!-- Lampiran -->
      <div class="rounded-2xl border border-mahir-border bg-white p-5">
        <label :class="labelCls">Lampiran</label>

        <!-- Lampiran yang sudah ada (mode edit) — read-only -->
        <ul v-if="existingAttachments.length" class="mb-3 flex flex-col gap-2">
          <li
            v-for="(att, idx) in existingAttachments"
            :key="`ex-${idx}`"
            class="flex items-center gap-3 rounded-lg border border-mahir-border bg-slate-50/60 px-3 py-2"
          >
            <PaperClipIcon class="h-4 w-4 flex-shrink-0 text-slate-400" />
            <a
              :href="att.file"
              target="_blank"
              rel="noopener"
              class="min-w-0 flex-1 truncate text-[13px] text-mahir-primary hover:underline"
            >
              {{ existingName(att.file) }}
            </a>
            <span class="flex-shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500">
              tersimpan
            </span>
          </li>
        </ul>

        <input
          ref="fileInput"
          type="file"
          multiple
          class="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-mahir-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-mahir-primary hover:file:bg-mahir-primary-soft/80"
          @change="onFilesChange"
        />
        <p class="mt-1 text-xs text-slate-400">
          {{ isEdit ? "Tambah berkas baru (lampiran lama tetap tersimpan)." : "Bisa lebih dari satu berkas (gambar/PDF/dokumen)." }}
        </p>

        <ul v-if="attachments.length" class="mt-3 flex flex-col gap-2">
          <li
            v-for="(file, idx) in attachments"
            :key="idx"
            class="flex items-center gap-3 rounded-lg border border-mahir-border bg-slate-50/60 px-3 py-2"
          >
            <PaperClipIcon class="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span class="min-w-0 flex-1 truncate text-[13px] text-slate-700">{{ file.name }}</span>
            <span class="flex-shrink-0 text-[11.5px] text-slate-400">{{ fileSize(file.size) }}</span>
            <button
              type="button"
              class="flex-shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              title="Hapus"
              @click="removeFile(idx)"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Sidebar pengaturan -->
    <div class="flex flex-col gap-4">
      <div class="rounded-2xl border border-mahir-border bg-white p-5">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Pengaturan</h2>

        <div class="mb-4">
          <label :class="labelCls">Status *</label>
          <select v-model="form.status" :key="statusOptions.length" :disabled="statusLoading" :class="fieldCls">
            <option value="">Pilih status</option>
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <p v-if="errors.status" class="mt-1 text-xs text-rose-500">{{ errors.status }}</p>
        </div>

        <label class="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-mahir-border p-3">
          <input v-model="form.isPinned" type="checkbox" class="mt-0.5 h-4 w-4 accent-mahir-primary" />
          <span>
            <span class="block text-sm font-medium text-slate-700">Sematkan (Pin)</span>
            <span class="block text-[12px] text-mahir-muted">Tampilkan di atas daftar pengumuman.</span>
          </span>
        </label>

        <div class="mb-4">
          <label :class="labelCls">Tayang Pada</label>
          <VueDatePicker
            v-model="form.publishedAt"
            format="dd MMM yyyy HH:mm"
            placeholder="Pilih tanggal & jam"
            auto-apply
          />
        </div>

        <div>
          <label :class="labelCls">Kedaluwarsa Pada</label>
          <VueDatePicker
            v-model="form.expiredAt"
            format="dd MMM yyyy HH:mm"
            :min-date="form.publishedAt || undefined"
            placeholder="Pilih tanggal & jam"
            auto-apply
          />
          <p v-if="errors.expiredAt" class="mt-1 text-xs text-rose-500">{{ errors.expiredAt }}</p>
        </div>
      </div>

      <!-- Tujuan -->
      <div class="rounded-2xl border border-mahir-border bg-white p-5">
        <h2 class="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Tujuan</h2>

        <div class="mb-4">
          <label :class="labelCls">Perusahaan</label>
          <SearchableSelect
            v-model="form.companyIds"
            multiple
            :selected="companySelected"
            :options="companyOptions"
            :loading="companyLoading"
            placeholder="Pilih perusahaan"
            search-placeholder="Cari perusahaan…"
            @search="setCompanySearch"
          />
        </div>

        <div>
          <label :class="labelCls">Unit</label>
          <SearchableSelect
            v-model="form.unitIds"
            multiple
            :selected="unitSelected"
            :options="unitOptions"
            :loading="unitLoading"
            placeholder="Pilih unit"
            search-placeholder="Cari unit…"
            @search="setUnitSearch"
          />
        </div>
      </div>

      <!-- Aksi -->
      <div class="flex items-center gap-2">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-mahir-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ saving ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Pengumuman" }}
        </button>
        <button
          type="button"
          class="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          @click="onCancel"
        >
          Batal
        </button>
      </div>
    </div>
  </form>
</template>

<style>
/* Selaraskan VueDatePicker dengan tema Mahir (radius & warna primary). */
:root {
  --dp-border-radius: 0.5rem;
  --dp-primary-color: #243b8f;
  --dp-font-size: 0.875rem;
}
.dp__input {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-color: var(--mahir-border, #e2e8f0);
}
</style>
