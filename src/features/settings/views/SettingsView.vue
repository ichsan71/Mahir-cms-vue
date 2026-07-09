<script setup>
// Port dari resources/views/pages/settings/index.blade.php
// Konfigurasi statis (tanpa GraphQL): nav kiri + panel kanan per seksi.
import { ref } from "vue";
import PageHeader from "@/shared/components/PageHeader.vue";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShareIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  BellIcon,
  PuzzlePieceIcon,
  CircleStackIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

const sections = [
  { id: "company", icon: BuildingOffice2Icon, label: "Profil Perusahaan" },
  { id: "attendance", icon: CalendarDaysIcon, label: "Kebijakan Kehadiran" },
  { id: "shift", icon: ClockIcon, label: "Shift Kerja" },
  { id: "overtime", icon: ClockIcon, label: "Kebijakan Lembur" },
  { id: "leave", icon: DocumentTextIcon, label: "Kebijakan Cuti" },
  { id: "holiday", icon: CalendarIcon, label: "Kalender Libur" },
  { id: "approval", icon: ShareIcon, label: "Alur Persetujuan" },
  { id: "payroll", icon: BanknotesIcon, label: "Komponen Penggajian" },
  { id: "performance", icon: ArrowTrendingUpIcon, label: "Performa & KPI" },
  { id: "ess", icon: IdentificationIcon, label: "Employee Self Service" },
  { id: "users", icon: ShieldCheckIcon, label: "Pengguna & Akses" },
  { id: "security", icon: LockClosedIcon, label: "Keamanan Akun" },
  { id: "notif", icon: BellIcon, label: "Notifikasi" },
  { id: "integration", icon: PuzzlePieceIcon, label: "Integrasi" },
  { id: "backup", icon: CircleStackIcon, label: "Data & Backup" },
];

const active = ref("company");
const activeLabel = () => sections.find((s) => s.id === active.value)?.label || "";

const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const workDays = ref([true, true, true, true, true, false, false]);

const fieldCls = "w-full rounded-lg border border-mahir-border px-3 py-2 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary";
const labelCls = "mb-1 block text-sm font-medium text-slate-700";

const toggles = ref({
  autoAbsent: true,
  lateNotif: true,
  gps: false,
  selfie: false,
});
</script>

<template>
  <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi perusahaan, kebijakan SDM, dan preferensi sistem" />

  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- Left nav -->
    <div class="lg:col-span-3">
      <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
        <div class="border-b border-mahir-border px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-mahir-muted">
          Menu Pengaturan
        </div>
        <nav class="py-2">
          <button
            v-for="s in sections"
            :key="s.id"
            class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium"
            :class="active === s.id ? 'bg-mahir-primary-soft text-mahir-primary' : 'text-slate-600 hover:bg-slate-50'"
            @click="active = s.id"
          >
            <component :is="s.icon" class="h-4 w-4 shrink-0" />
            <span>{{ s.label }}</span>
            <ChevronRightIcon class="ml-auto h-3.5 w-3.5 text-slate-300" />
          </button>
        </nav>
      </div>
    </div>

    <!-- Right panel -->
    <div class="lg:col-span-9">
      <!-- Profil Perusahaan -->
      <div v-if="active === 'company'" class="rounded-2xl border border-mahir-border bg-white p-6">
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="font-semibold text-slate-900">Profil Perusahaan</h2>
            <p class="text-[13px] text-slate-400">Informasi dasar perusahaan Anda</p>
          </div>
          <button class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90">
            <ArrowDownTrayIcon class="h-4 w-4" /> Simpan Perubahan
          </button>
        </div>

        <div class="mb-4 flex items-center gap-4 border-b border-slate-100 pb-4">
          <div class="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-mahir-sidebar-bg font-display text-[22px] font-bold text-white">M</div>
          <div>
            <div class="text-sm font-semibold text-slate-800">Logo Perusahaan</div>
            <div class="mb-2 text-[12.5px] text-slate-400">Format PNG atau SVG, maks 2MB, rekomendasi 200×200px</div>
            <button class="inline-flex items-center rounded-lg border border-mahir-border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"><ArrowUpTrayIcon class="mr-1 h-4 w-4" /> Unggah Logo</button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label :class="labelCls">Nama Perusahaan *</label><input :class="fieldCls" value="PT Mazta Group" /></div>
          <div><label :class="labelCls">Nama Singkat</label><input :class="fieldCls" value="Mazta Group" /></div>
          <div><label :class="labelCls">NPWP Perusahaan</label><input :class="fieldCls" placeholder="00.000.000.0-000.000" /></div>
          <div><label :class="labelCls">Bidang Usaha</label><input :class="fieldCls" value="Teknologi Informasi" /></div>
          <div><label :class="labelCls">Email Perusahaan</label><input :class="fieldCls" value="info@maztagroup.com" /></div>
          <div><label :class="labelCls">Nomor Telepon</label><input :class="fieldCls" value="+62 21 0000 0000" /></div>
          <div class="md:col-span-2"><label :class="labelCls">Alamat</label><textarea :class="fieldCls" rows="2">Jl. Sudirman Kav. 52, Jakarta Selatan, 12190</textarea></div>
          <div><label :class="labelCls">Kota</label><input :class="fieldCls" value="Jakarta Selatan" /></div>
          <div><label :class="labelCls">Provinsi</label><input :class="fieldCls" value="DKI Jakarta" /></div>
          <div><label :class="labelCls">Kode Pos</label><input :class="fieldCls" value="12190" /></div>
        </div>
      </div>

      <!-- Kebijakan Kehadiran -->
      <div v-else-if="active === 'attendance'" class="rounded-2xl border border-mahir-border bg-white p-6">
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 class="font-semibold text-slate-900">Kebijakan Kehadiran</h2>
            <p class="text-[13px] text-slate-400">Atur jam kerja, toleransi, dan aturan absensi</p>
          </div>
          <button class="flex items-center gap-1.5 rounded-lg bg-mahir-primary px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-mahir-primary/90">
            <ArrowDownTrayIcon class="h-4 w-4" /> Simpan
          </button>
        </div>

        <div class="mb-5">
          <div class="mb-3 text-sm font-semibold text-slate-800">Jam Kerja Default</div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div><label :class="labelCls">Jam Masuk</label><input type="time" :class="fieldCls" value="08:00" /></div>
            <div><label :class="labelCls">Jam Keluar</label><input type="time" :class="fieldCls" value="17:00" /></div>
            <div><label :class="labelCls">Toleransi Telat (menit)</label><input type="number" :class="fieldCls" value="15" /></div>
            <div><label :class="labelCls">Lembur Setelah (menit)</label><input type="number" :class="fieldCls" value="60" /></div>
          </div>
        </div>

        <div class="mb-5">
          <div class="mb-3 text-sm font-semibold text-slate-800">Hari Kerja</div>
          <div class="flex flex-wrap gap-2">
            <label v-for="(d, i) in days" :key="d" class="flex cursor-pointer items-center gap-2 rounded-lg border border-mahir-border px-3 py-2 text-[13.5px]">
              <input v-model="workDays[i]" type="checkbox" class="h-4 w-4 rounded border-slate-300" /> {{ d }}
            </label>
          </div>
        </div>

        <div>
          <div class="mb-3 text-sm font-semibold text-slate-800">Kebijakan Kehadiran</div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-mahir-border p-3">
              <span><span class="block text-[13.5px] font-semibold text-slate-800">Absensi Otomatis</span><span class="text-xs text-slate-400">Tandai absen jika tidak check-in pukul 12.00</span></span>
              <input v-model="toggles.autoAbsent" type="checkbox" class="h-5 w-5 rounded border-slate-300" />
            </label>
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-mahir-border p-3">
              <span><span class="block text-[13.5px] font-semibold text-slate-800">Notifikasi Keterlambatan</span><span class="text-xs text-slate-400">Kirim notifikasi ke atasan saat karyawan terlambat</span></span>
              <input v-model="toggles.lateNotif" type="checkbox" class="h-5 w-5 rounded border-slate-300" />
            </label>
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-mahir-border p-3">
              <span><span class="block text-[13.5px] font-semibold text-slate-800">GPS Check-in</span><span class="text-xs text-slate-400">Wajibkan lokasi saat absen masuk</span></span>
              <input v-model="toggles.gps" type="checkbox" class="h-5 w-5 rounded border-slate-300" />
            </label>
            <label class="flex cursor-pointer items-center justify-between rounded-lg border border-mahir-border p-3">
              <span><span class="block text-[13.5px] font-semibold text-slate-800">Selfie Check-in</span><span class="text-xs text-slate-400">Wajibkan foto saat absen masuk</span></span>
              <input v-model="toggles.selfie" type="checkbox" class="h-5 w-5 rounded border-slate-300" />
            </label>
          </div>
        </div>
      </div>

      <!-- Seksi lain (placeholder) -->
      <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mahir-border bg-white p-12 text-center">
        <Cog6ToothIcon class="h-9 w-9 text-slate-300" />
        <h2 class="mt-3 font-semibold text-slate-800">{{ activeLabel() }}</h2>
        <p class="mt-1 max-w-sm text-[13px] text-slate-400">
          Konfigurasi untuk seksi ini akan tersedia setelah backend pengaturan terhubung.
        </p>
      </div>
    </div>
  </div>
</template>
