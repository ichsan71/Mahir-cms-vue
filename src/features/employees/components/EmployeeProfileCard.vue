<script setup>
// Kartu profil karyawan (read-only). Dipakai ulang di EmployeeDetailView
// (mode super admin) dan MyProfileView (mode "profil saya" non-superadmin).
import { ref } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import ImagePreview from "@/shared/components/ImagePreview.vue";
import { initials, formatDate } from "@/shared/utils/format";
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  MapIcon,
  IdentificationIcon,
  ClockIcon,
  CalendarDaysIcon,
  ShareIcon,
  UsersIcon,
  UserIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

defineProps({
  employee: { type: Object, required: true },
  // Aktifkan kontrol kelola alamat (tambah/ubah/hapus) di kartu alamat.
  editableAddress: { type: Boolean, default: false },
  canAddAddress: { type: Boolean, default: false },
  canEditAddress: { type: Boolean, default: false },
  canDeleteAddress: { type: Boolean, default: false },
});

const emit = defineEmits(["add-address", "edit-address", "delete-address"]);

// Lightbox foto profil.
const previewOpen = ref(false);

// Jumlah hari kerja dalam pola kerja karyawan (untuk ringkasan jadwal).
function workdayCount(wp) {
  return (wp?.details ?? []).filter((d) => d.isWorkday).length;
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

    <div class="space-y-6 lg:col-span-2">

      <div class="relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            class="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-mahir-primary-soft text-xl font-bold text-mahir-primary tracking-wide shadow-inner"
            :class="employee.image ? 'cursor-zoom-in ring-1 ring-transparent transition hover:ring-mahir-primary' : ''"
            @click="employee.image && (previewOpen = true)"
          >
            <img
              v-if="employee.image"
              :src="employee.image"
              :alt="employee.fullName"
              class="h-full w-full object-cover"
            />
            <template v-else>{{ initials(employee.fullName) }}</template>
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ employee.fullName }}</h1>
              <StatusBadge :status="employee.user?.isActive ? 'active' : 'inactive'" />
            </div>
            <p class="mt-1 text-sm font-medium text-slate-600">
              {{ employee.level?.name ?? "—" }}
              <span class="mx-1.5 text-slate-300">·</span>
              <span>{{ employee.units?.map(u => u.name).join(', ') || '—' }}</span>
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>ID Karyawan: <strong class="font-mono text-slate-600">{{ employee.code || "—" }}</strong></span>
              <span class="text-slate-300">|</span>
              <span>NIK KTP: <strong class="font-mono text-slate-600">{{ employee.nik || "—" }}</strong></span>
              <span class="text-slate-300">|</span>
              <span>Masuk: <strong class="text-slate-600">{{ formatDate(employee.hiredDate) }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
          <BriefcaseIcon class="h-4 w-4 text-mahir-primary" />
          <h2 class="font-display text-[15px] font-bold text-slate-900">Struktur & Hubungan Kerja</h2>
        </div>

        <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
          <div class="flex items-start gap-3">
            <BuildingOffice2Icon class="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Perusahaan</div>
              <div class="mt-0.5 text-sm font-medium text-slate-800">
                {{ employee.companies?.map(c => c.name).join(', ') || '—' }}
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <MapPinIcon class="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cabang Penempatan</div>
              <div class="mt-0.5 text-sm font-medium text-slate-800">{{ employee.branch?.name ?? "—" }}</div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <IdentificationIcon class="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tipe Kontrak</div>
              <div class="mt-0.5 text-sm font-medium text-slate-800">
                <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {{ employee.employmentType?.name ?? "—" }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <ClockIcon class="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pola Kerja & Jadwal</div>
              <div class="mt-0.5 text-sm font-medium text-slate-800">
                {{ employee.workPattern?.name ?? "—" }}
              </div>
              <div v-if="employee.workPattern?.details?.length" class="mt-1 flex flex-col gap-0.5 text-xs text-slate-500 bg-slate-50 p-1.5 rounded-md border border-slate-100/80">
                <span class="flex items-center gap-1">
                  <CalendarDaysIcon class="h-3 w-3" />
                  {{ workdayCount(employee.workPattern) }} hari kerja / minggu
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3 sm:col-span-2 border-t border-slate-50 pt-3 mt-1">
            <ShareIcon class="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Atasan Langsung</div>
              <div class="mt-0.5 text-sm font-medium text-slate-800">
                <template v-if="employee.parent">
                  {{ employee.parent.fullName }} <span class="text-xs text-slate-400">({{ employee.parent.nik }})</span>
                </template>
                <template v-else><span class="text-slate-400 italic">Tidak ada atasan langsung</span></template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
          <IdentificationIcon class="h-4 w-4 text-mahir-primary" />
          <h2 class="font-display text-[15px] font-bold text-slate-900">Biodata Pribadi</h2>
        </div>

        <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama Lengkap (KTP)</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">
              {{ employee.firstName }} {{ employee.middleName ? employee.middleName + ' ' : '' }}{{ employee.lastName }}
            </dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Agama</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ employee.religion || "—" }}</dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tempat, Tanggal Lahir</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">
              {{ employee.birthPlace || "—" }}, {{ formatDate(employee.birthDate) }}
            </dd>
          </div>
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status Pernikahan</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ employee.maritalStatus || "—" }}</dd>
          </div>
          <div v-if="employee.citizenship">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kewarganegaraan</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ employee.citizenship }}</dd>
          </div>
          <div v-if="employee.resignDate">
            <dt class="text-[11px] font-semibold uppercase tracking-wider text-rose-500">Tanggal Resign</dt>
            <dd class="mt-0.5 text-sm font-semibold text-rose-600">{{ formatDate(employee.resignDate) }}</dd>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <UsersIcon class="h-4 w-4 text-mahir-primary" />
          <h2 class="font-display text-[15px] font-bold text-slate-900">Anggota Tim</h2>
        </div>

        <div v-if="!employee.childrens?.length" class="text-sm italic text-slate-400 p-2 bg-slate-50/50 rounded-lg">
          Tidak ada anggota tim.
        </div>
        <div v-else class="overflow-hidden rounded-xl border border-slate-100">
          <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead class="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th class="p-3">Nama Staff</th>
                <th class="p-3">NIK</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="child in employee.childrens" :key="child.id" class="hover:bg-slate-50/50">
                <td class="p-3 font-medium text-slate-800">{{ child.fullName }}</td>
                <td class="p-3 font-mono text-xs text-slate-500">{{ child.nik || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
        <h2 class="mb-2 text-[13px] font-bold uppercase tracking-wider text-slate-400">Catatan & Deskripsi</h2>
        <p class="whitespace-pre-line text-sm leading-relaxed text-slate-600 bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200">
          {{ employee.description || "Tidak ada deskripsi tambahan untuk karyawan ini." }}
        </p>
      </div>
    </div>

    <div class="space-y-6">

      <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
        <h2 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Akses Aplikasi</h2>
        <div class="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
          <div class="text-[11px] font-medium text-slate-400">Email Utama</div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-3 group">
              <div class="flex items-center gap-2 min-w-0">
                <span class="truncate text-sm font-medium text-slate-700">
                  {{ employee.user?.email || "—" }}
                </span>
              </div>
              <button
                v-if="employee.user?.email"
                class="text-slate-400 hover:text-mahir-primary md:opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
                title="Copy Email"
              >
                <DocumentDuplicateIcon class="h-4 w-4" />
              </button>
            </div>

            <div class="flex items-center justify-between gap-3 group">
              <div class="flex items-center gap-2 min-w-0">
                <UserCircleIcon class="h-4 w-4 text-slate-400 shrink-0" />
                <span class="truncate text-xs font-normal text-slate-500">
                  {{ employee.user?.username || "—" }} (Username)
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3">
            <div>
              <div class="text-[10px] font-medium tracking-wide uppercase text-slate-400">Status Staff</div>
              <div class="mt-1">
                <span v-if="employee.user?.isStaff" class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-mahir-primary ring-1 ring-inset ring-blue-600/10">
                  <span class="h-1.5 w-1.5 rounded-full bg-mahir-primary"></span> Staff
                </span>
                <span v-else class="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Bukan Staff
                </span>
              </div>
            </div>
            <div>
              <div class="text-[10px] font-medium tracking-wide uppercase text-slate-400">Status Login</div>
              <div class="mt-1">
                <span v-if="employee.user?.isActive" class="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                </span>
                <span v-else class="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10">
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Nonaktif
                </span>
              </div>
            </div>
            <div class="col-span-2 mt-2 pt-2 border-t border-slate-100" v-if="employee.user?.isSuperuser">
              <span class="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/10 w-full justify-center">
                <ShieldCheckIcon class="h-3.5 w-3.5" /> Superuser / Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between gap-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Lokasi / Tempat Tinggal</h2>
          <button
            v-if="editableAddress && canAddAddress"
            class="inline-flex items-center gap-1 rounded-lg bg-mahir-primary-soft px-2 py-1 text-[11px] font-semibold text-mahir-primary hover:bg-mahir-primary/10"
            title="Tambah alamat"
            @click="emit('add-address')"
          >
            <PlusIcon class="h-3.5 w-3.5" /> Tambah
          </button>
        </div>

        <div v-if="!employee.addresses?.length" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
          <MapPinIcon class="h-5 w-5 mb-1" />
          <span class="text-xs">Belum ada data alamat resmi.</span>
        </div>

        <ul v-else class="space-y-3">
          <li v-for="addr in employee.addresses" :key="addr.id" class="group relative rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-xs">
            <div class="pr-14">
              <div class="text-xs font-semibold text-slate-800">{{ addr.line1 || "—" }}</div>
              <div v-if="addr.line2" class="text-xs text-slate-500 mt-0.5">{{ addr.line2 }}</div>
              <div class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <MapIcon class="h-3.5 w-3.5 shrink-0" />
                <span class="truncate">
                  {{ [addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "—" }}
                </span>
              </div>
            </div>
            <div v-if="editableAddress" class="absolute right-2.5 top-2.5 flex items-center gap-1">
              <button
                v-if="canEditAddress"
                class="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-mahir-primary"
                title="Ubah alamat"
                @click="emit('edit-address', addr)"
              >
                <PencilIcon class="h-3.5 w-3.5" />
              </button>
              <button
                v-if="canDeleteAddress"
                class="flex h-6 w-6 items-center justify-center rounded-md bg-white text-rose-500 ring-1 ring-rose-100 hover:bg-rose-50"
                title="Hapus alamat"
                @click="emit('delete-address', addr)"
              >
                <TrashIcon class="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="employee.responses?.length" class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Tanggung Jawab / Bawahan</h2>
        <ul class="space-y-2">
          <li v-for="resp in employee.responses" :key="resp.id" class="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <UserIcon class="h-4 w-4 shrink-0 text-slate-400" />
            <span class="font-medium">{{ resp.fullName }}</span>
          </li>
        </ul>
      </div>

    </div>

    <ImagePreview
      v-model:open="previewOpen"
      :src="employee.image"
      :alt="employee.fullName"
    />
  </div>
</template>
