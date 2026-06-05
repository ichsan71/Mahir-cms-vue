<script setup>
import StatusBadge from "@/shared/components/StatusBadge.vue";

defineProps({
  leaves: { type: Array, default: () => [] },
});

const emit = defineEmits(["approve", "reject"]);
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-mahir-border text-xs uppercase tracking-wide text-slate-400">
          <th class="px-4 py-3 font-semibold">Karyawan</th>
          <th class="px-4 py-3 font-semibold">Jenis</th>
          <th class="px-4 py-3 font-semibold">Tanggal</th>
          <th class="px-4 py-3 font-semibold">Status</th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!leaves.length">
          <td colspan="5" class="px-4 py-6 text-center text-slate-400">
            Tidak ada pengajuan menunggu.
          </td>
        </tr>
        <tr
          v-for="lv in leaves"
          :key="lv.id"
          class="border-b border-mahir-border last:border-0"
        >
          <td class="px-4 py-3 font-semibold text-slate-800">{{ lv.emp }}</td>
          <td class="px-4 py-3 text-slate-600">{{ lv.type }}</td>
          <td class="px-4 py-3 text-slate-600">{{ lv.dateRange }}</td>
          <td class="px-4 py-3"><StatusBadge :status="lv.status" /></td>
          <td class="px-4 py-3">
            <div class="flex gap-1.5">
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-success text-white hover:opacity-90"
                title="Setujui"
                @click="emit('approve', lv.id)"
              >
                <i class="bi bi-check-lg"></i>
              </button>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-mahir-danger text-white hover:opacity-90"
                title="Tolak"
                @click="emit('reject', lv.id)"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
