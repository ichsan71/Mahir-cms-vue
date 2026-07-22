<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBranchDetail } from "../composables/useBranchDetail";
import { useBranchAddresses, useBranchAddressForm } from "../composables/useBranchAddresses";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";
import BranchAddressFormModal from "../components/BranchAddressFormModal.vue";
import ImagePreview from "@/shared/components/ImagePreview.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";
import { initials } from "@/shared/utils/format";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  MapPinIcon,
  UsersIcon,
  BuildingOffice2Icon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = computed(() => route.params.id);
const { branch, loading } = useBranchDetail(id);

const companies = computed(() => branch.value?.companies ?? []);
const employees = computed(() => branch.value?.employees ?? []);

// Filter karyawan (client-side): nama, NIK, level, atau unit.
const employeeSearch = ref("");
const filteredEmployees = computed(() => {
  const q = employeeSearch.value.trim().toLowerCase();
  if (!q) return employees.value;
  return employees.value.filter((emp) => {
    const haystack = [
      emp.fullName,
      emp.nik,
      emp.level?.name,
      ...(emp.units ?? []).map((u) => u.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
});

// Alamat cabang (difilter lewat nama cabang).
const branchName = computed(() => branch.value?.name ?? null);
const { addresses, loading: addressesLoading, refetch: refetchAddresses } = useBranchAddresses(branchName);
const { createAddress, editAddress, deleteAddress, loading: addressSaving } = useBranchAddressForm();

// Kebijakan: satu cabang hanya boleh punya satu alamat.
const canAddAddress = computed(() => auth.can(PERM.ADDRESS_CREATE) && addresses.value.length === 0);

const addressModalOpen = ref(false);
const editingAddress = ref(null);

function openAddAddress() {
  editingAddress.value = null;
  addressModalOpen.value = true;
}

function openEditAddress(address) {
  editingAddress.value = address;
  addressModalOpen.value = true;
}

async function handleSaveAddress({ id, input }) {
  const result = id ? await editAddress(id, input) : await createAddress(input);
  if (result) {
    addressModalOpen.value = false;
    refetchAddresses();
  }
}

// Hapus alamat: konfirmasi dulu.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

function openDeleteAddress(address) {
  deleteTarget.value = address;
  confirmOpen.value = true;
}

async function handleDeleteAddress() {
  if (!deleteTarget.value) return;
  const ok = await deleteAddress(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetchAddresses();
  }
}

// Gabungkan nama unit (relasi many) menjadi satu teks.
function unitNames(emp) {
  return (emp.units ?? []).map((u) => u.name).join(", ");
}

// Lightbox foto karyawan.
const preview = ref({ open: false, src: "", alt: "" });
function openPreview(emp) {
  if (!emp.image) return;
  preview.value = { open: true, src: emp.image, alt: emp.fullName };
}

function goBack() {
  router.push({ name: "cabang" });
}
</script>

<template>
  <div class="mb-5 flex items-center justify-between">
    <button
      class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mahir-muted transition-colors hover:text-slate-900"
      @click="goBack"
    >
      <ArrowLeftIcon class="h-4 w-4" /> Kembali
    </button>
  </div>

  <div
    v-if="loading && !branch"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data cabang...</p>
  </div>

  <div
    v-else-if="!branch"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <MapPinIcon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data cabang tidak ditemukan</p>
    <p class="mt-1 text-xs text-slate-400">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Header -->
        <div class="relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>
          <div class="flex items-center gap-4">
            <span
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-mahir-primary-soft text-2xl text-mahir-primary shadow-inner"
            >
              <MapPinIcon class="h-7 w-7" />
            </span>
            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ branch.name }}</h1>
              <p class="mt-1 text-sm font-medium text-slate-600">
                {{ employees.length }} karyawan · {{ companies.length }} perusahaan
              </p>
            </div>
          </div>
        </div>

        <!-- Karyawan -->
        <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div class="flex items-center gap-2">
              <UsersIcon class="h-4 w-4 text-mahir-primary" />
              <h2 class="font-display text-[15px] font-bold text-slate-900">Karyawan</h2>
              <span class="text-[13px] font-normal text-slate-400">{{ employees.length }}</span>
            </div>
            <div v-if="employees.length" class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                v-model="employeeSearch"
                type="text"
                placeholder="Cari nama, NIK, unit…"
                class="w-full rounded-lg border border-mahir-border py-1.5 pl-9 pr-3 text-sm focus:border-mahir-primary focus:outline-none focus:ring-1 focus:ring-mahir-primary sm:w-64"
              />
            </div>
          </div>
          <div
            v-if="!employees.length"
            class="px-5 py-8 text-center text-sm text-slate-400"
          >
            Belum ada karyawan pada cabang ini.
          </div>
          <div
            v-else-if="!filteredEmployees.length"
            class="px-5 py-8 text-center text-sm text-slate-400"
          >
            Tidak ada karyawan yang cocok dengan "{{ employeeSearch }}".
          </div>
          <ul v-else class="max-h-80 divide-y divide-mahir-border overflow-y-auto">
            <li v-for="emp in filteredEmployees" :key="emp.id" class="flex items-center gap-2.5 px-5 py-3">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-mahir-primary-soft text-xs font-bold text-mahir-primary"
                :class="emp.image ? 'cursor-zoom-in ring-1 ring-transparent hover:ring-mahir-primary' : ''"
                @click="openPreview(emp)"
              >
                <img
                  v-if="emp.image"
                  :src="emp.image"
                  :alt="emp.fullName"
                  class="h-full w-full object-cover"
                />
                <template v-else>{{ initials(emp.fullName) }}</template>
              </span>
              <div class="min-w-0 flex-1">
                <div class="truncate text-[13.5px] font-semibold text-slate-800">{{ emp.fullName }}</div>
                <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-slate-400">
                  <span>NIK: {{ emp.nik || "—" }}</span>
                  <span v-if="emp.level?.name" class="text-slate-300">·</span>
                  <span v-if="emp.level?.name">{{ emp.level.name }}</span>
                  <span v-if="unitNames(emp)" class="text-slate-300">·</span>
                  <span v-if="unitNames(emp)" class="truncate">{{ unitNames(emp) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sidebar: perusahaan & alamat -->
      <div class="space-y-6">
        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Perusahaan</h2>
          <div
            v-if="!companies.length"
            class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400"
          >
            Belum ada perusahaan terkait.
          </div>
          <ul v-else class="space-y-1.5">
            <li
              v-for="c in companies"
              :key="c.id"
              class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <BuildingOffice2Icon class="h-4 w-4 shrink-0 text-slate-400" />
              <span class="truncate">{{ c.name }}</span>
            </li>
          </ul>
        </div>

        <!-- Alamat cabang (maksimal satu) -->
        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Alamat</h2>
            <button
              v-if="canAddAddress"
              class="inline-flex items-center gap-1 rounded-lg bg-mahir-primary-soft px-2 py-1 text-[11px] font-semibold text-mahir-primary hover:bg-mahir-primary/10"
              title="Tambah alamat"
              @click="openAddAddress"
            >
              <PlusIcon class="h-3.5 w-3.5" /> Tambah
            </button>
          </div>

          <div
            v-if="addressesLoading && !addresses.length"
            class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400"
          >
            Memuat alamat…
          </div>
          <div
            v-else-if="!addresses.length"
            class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400"
          >
            <MapPinIcon class="mb-1 h-5 w-5" />
            <span class="text-xs">Belum ada alamat cabang.</span>
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="addr in addresses"
              :key="addr.id"
              class="group relative rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-3.5 shadow-xs"
            >
              <div class="pr-14">
                <div class="text-xs font-semibold text-slate-800">{{ addr.line1 || "—" }}</div>
                <div v-if="addr.line2" class="mt-0.5 text-xs text-slate-500">{{ addr.line2 }}</div>
                <div class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <MapPinIcon class="h-3.5 w-3.5 shrink-0" />
                  <span class="truncate">
                    {{ [addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "—" }}
                  </span>
                </div>
              </div>
              <div class="absolute right-2.5 top-2.5 flex items-center gap-1">
                <button
                  v-if="auth.can(PERM.ADDRESS_EDIT)"
                  class="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-mahir-primary"
                  title="Ubah alamat"
                  @click="openEditAddress(addr)"
                >
                  <PencilSquareIcon class="h-3.5 w-3.5" />
                </button>
                <button
                  v-if="auth.can(PERM.ADDRESS_DELETE)"
                  class="flex h-6 w-6 items-center justify-center rounded-md bg-white text-rose-500 ring-1 ring-rose-100 hover:bg-rose-50"
                  title="Hapus alamat"
                  @click="openDeleteAddress(addr)"
                >
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal tambah/ubah alamat cabang -->
    <BranchAddressFormModal
      v-model:open="addressModalOpen"
      :saving="addressSaving"
      :branch-id="branch.id"
      :address="editingAddress"
      @save="handleSaveAddress"
    />

    <!-- Konfirmasi hapus alamat -->
    <ConfirmDialog
      v-model:open="confirmOpen"
      title="Hapus Alamat"
      message="Hapus alamat cabang ini? Tindakan ini tidak dapat dibatalkan."
      confirm-text="Ya, Hapus"
      :loading="addressSaving"
      @confirm="handleDeleteAddress"
    />

    <!-- Lightbox foto karyawan -->
    <ImagePreview v-model:open="preview.open" :src="preview.src" :alt="preview.alt" />
  </template>
</template>
