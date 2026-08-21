<script setup>
// Ringkasan identitas karyawan (avatar, nama, posisi/jabatan, ID, masa masuk).
// Dipakai sebagai header persisten di atas tab detail karyawan (tetap tampil
// walau ganti tab) dan sebagai blok atas kartu profil (MyProfileView).
import { ref } from "vue";
import StatusBadge from "@/shared/components/StatusBadge.vue";
import ImagePreview from "@/shared/components/ImagePreview.vue";
import { initials, formatDate } from "@/shared/utils/format";

defineProps({
  employee: { type: Object, required: true },
  // Tampilkan NIK (KTP) — data konfidensial; false pada detail karyawan lain.
  showNik: { type: Boolean, default: true },
});

// Lightbox foto profil.
const previewOpen = ref(false);
</script>

<template>
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
          <template v-if="showNik">
            <span class="text-slate-300">|</span>
            <span>NIK KTP: <strong class="font-mono text-slate-600">{{ employee.nik || "—" }}</strong></span>
          </template>
          <span class="text-slate-300">|</span>
          <span>Masuk: <strong class="text-slate-600">{{ formatDate(employee.hiredDate) }}</strong></span>
        </div>
      </div>
    </div>

    <ImagePreview
      v-model:open="previewOpen"
      :src="employee.image"
      :alt="employee.fullName"
    />
  </div>
</template>
