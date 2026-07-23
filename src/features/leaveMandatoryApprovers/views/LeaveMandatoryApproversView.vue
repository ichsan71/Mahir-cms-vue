<script setup>
import { useLeaveMandatoryApprovers } from "../composables/useLeaveMandatoryApprovers";
import LeaveMandatoryApproverToolbar from "../components/LeaveMandatoryApproverToolbar.vue";
import LeaveMandatoryApproverTable from "../components/LeaveMandatoryApproverTable.vue";

const { approvers, pagination, loading, nextPage, prevPage } = useLeaveMandatoryApprovers();
</script>

<template>
  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Approver Wajib
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveMandatoryApproverToolbar />
    </div>

    <LeaveMandatoryApproverTable :approvers="approvers" :loading="loading" />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ approvers.length }} dari {{ pagination.count }} approver</span
      >
      <nav class="flex items-center gap-1">
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasPrev"
          @click="prevPage"
        >
          ‹
        </button>
        <span class="rounded-lg bg-mahir-primary px-3 py-1 text-sm font-medium text-white">
          {{ pagination.currentPage }}
        </span>
        <span class="px-1 text-[13px] text-mahir-muted">dari {{ pagination.totalPages }}</span>
        <button
          class="rounded-lg border border-mahir-border px-2.5 py-1 text-sm disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50"
          :disabled="!pagination.hasNext"
          @click="nextPage"
        >
          ›
        </button>
      </nav>
    </div>
  </div>
</template>
