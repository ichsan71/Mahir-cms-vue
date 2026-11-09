<script setup>
// BPJS pada "Profil Saya". Read-only; data one-to-one dari field nested
// `getEmployee.bpjs` (sudah ikut di GET_MY_PROFILE core fields).
import { computed } from "vue";
import { formatDate } from "@/shared/utils/format";
import { ShieldCheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  bpjs: { type: Object, default: null },
});

const hasBpjs = computed(() => !!props.bpjs);
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex items-center gap-2 border-b border-mahir-border px-5 py-4">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-mahir-primary-soft text-mahir-primary">
        <ShieldCheckIcon class="h-5 w-5" />
      </span>
      <div>
        <h2 class="font-semibold text-slate-900">BPJS</h2>
        <p class="text-[11.5px] text-slate-400">Kesehatan &amp; Ketenagakerjaan</p>
      </div>
    </div>

    <div class="p-5">
      <div v-if="!hasBpjs" class="py-10 text-center text-sm text-slate-400">
        Belum ada data BPJS untuk Anda.
      </div>

      <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div class="rounded-xl border border-mahir-border p-4">
          <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Kesehatan</div>
          <dl class="space-y-1.5 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-slate-400">Nomor</dt>
              <dd class="font-medium text-slate-700">{{ bpjs.kesehatanNumber || "-" }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-400">Kelas</dt>
              <dd class="font-medium text-slate-700">{{ bpjs.kesehatanClass ? `Kelas ${bpjs.kesehatanClass}` : "-" }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-400">Tgl Terdaftar</dt>
              <dd class="font-medium text-slate-700">{{ bpjs.kesehatanRegisteredDate ? formatDate(bpjs.kesehatanRegisteredDate) : "-" }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-xl border border-mahir-border p-4">
          <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mahir-primary">BPJS Ketenagakerjaan</div>
          <dl class="space-y-1.5 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-slate-400">Nomor</dt>
              <dd class="font-medium text-slate-700">{{ bpjs.ketenagakerjaanNumber || "-" }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-slate-400">Tgl Terdaftar</dt>
              <dd class="font-medium text-slate-700">{{ bpjs.ketenagakerjaanRegisteredDate ? formatDate(bpjs.ketenagakerjaanRegisteredDate) : "-" }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="bpjs.notes" class="md:col-span-2 text-[13px] text-slate-500">
          <span class="font-medium text-slate-600">Catatan:</span> {{ bpjs.notes }}
        </div>
      </div>
    </div>
  </div>
</template>
