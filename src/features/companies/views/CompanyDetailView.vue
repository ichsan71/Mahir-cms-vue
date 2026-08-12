<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCompanyDetail } from "../composables/useCompanyDetail";
import { initials } from "@/shared/utils/format";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  PhoneIcon,
  GlobeAltIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);
const { company, loading } = useCompanyDetail(id);

// Normalkan website menjadi URL yang bisa diklik.
const websiteHref = computed(() => {
  const w = company.value?.website?.trim();
  if (!w) return null;
  return /^https?:\/\//i.test(w) ? w : `https://${w}`;
});

function goBack() {
  router.push({ name: "perusahaan" });
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
    v-if="loading && !company"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <ArrowPathIcon class="mb-3 h-7 w-7 animate-spin text-mahir-primary" />
    <p class="text-sm font-medium text-slate-500">Sinkronisasi data perusahaan...</p>
  </div>

  <div
    v-else-if="!company"
    class="flex flex-col items-center justify-center rounded-2xl border border-mahir-border bg-white p-16 text-center"
  >
    <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <BuildingOffice2Icon class="h-6 w-6" />
    </div>
    <p class="text-sm font-medium text-slate-600">Data perusahaan tidak ditemukan</p>
    <p class="mt-1 text-xs text-slate-400">Pastikan ID yang Anda tuju sudah benar atau hubungi super admin.</p>
  </div>

  <template v-else>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Header -->
        <div class="relative overflow-hidden rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mahir-primary/[0.02]"></div>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              v-if="company.logo"
              :src="company.logo"
              :alt="company.name"
              class="h-16 w-16 flex-shrink-0 rounded-2xl object-cover shadow-inner"
            />
            <span
              v-else
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-mahir-primary-soft text-xl font-bold tracking-wide text-mahir-primary shadow-inner"
            >
              {{ initials(company.name) }}
            </span>
            <div class="min-w-0 flex-1">
              <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ company.name }}</h1>
              <p v-if="company.legalName" class="mt-1 text-sm font-medium text-slate-600">
                {{ company.legalName }}
              </p>
            </div>
          </div>
        </div>

        <!-- Informasi -->
        <div class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <InformationCircleIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Informasi Perusahaan</h2>
          </div>

          <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
            <div class="flex items-start gap-3">
              <DocumentTextIcon class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nama Legal</div>
                <div class="mt-0.5 text-sm font-medium text-slate-800">{{ company.legalName || "—" }}</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <PhoneIcon class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Telepon</div>
                <div class="mt-0.5 text-sm font-medium text-slate-800">{{ company.phone || "—" }}</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <GlobeAltIcon class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Website</div>
                <div class="mt-0.5 text-sm font-medium text-slate-800">
                  <a
                    v-if="websiteHref"
                    :href="websiteHref"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-mahir-primary hover:underline"
                    >{{ company.website }}</a
                  >
                  <span v-else>—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW SECTION: Hubungan Perusahaan (Parent & Children) -->
        <div v-if="company.parent || (company.childrens && company.childrens.length > 0)" class="rounded-2xl border border-mahir-border bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShareIcon class="h-4 w-4 text-mahir-primary" />
            <h2 class="font-display text-[15px] font-bold text-slate-900">Struktur Perusahaan</h2>
          </div>

          <div class="space-y-5">
            <div v-if="company.parent">
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Perusahaan Induk (Parent)</div>
              <div class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <BuildingOffice2Icon class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-bold text-slate-800 truncate">{{ company.parent.name }}</div>
                  <div class="text-xs text-slate-400 truncate">{{ company.parent.legalName || '—' }}</div>
                </div>
              </div>
            </div>

            <div v-if="company.childrens && company.childrens.length > 0">
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Anak Perusahaan (Children)</div>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div 
                  v-for="child in company.childrens" 
                  :key="child.id" 
                  class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:border-slate-200 transition-colors"
                >
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BuildingOfficeIcon class="h-4 w-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-slate-800 truncate">{{ child.name }}</div>
                    <div class="text-xs text-slate-400 truncate">{{ child.legalName || '—' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: kontak -->
      <div class="space-y-6">
        <div class="rounded-2xl border border-mahir-border bg-white p-5 shadow-sm">
          <h2 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Kontak</h2>
          <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div class="text-[11px] font-medium text-slate-400">Email Utama</div>
            <div class="mt-0.5 flex items-center justify-between gap-2">
              <span class="truncate text-sm font-semibold text-slate-800">{{ company.email || "—" }}</span>
            </div>

            <div class="mt-4 border-t border-slate-200/60 pt-3">
              <div class="text-[10px] font-medium text-slate-400">Telepon</div>
              <div class="mt-0.5 text-xs font-bold text-slate-700">{{ company.phone || "—" }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
