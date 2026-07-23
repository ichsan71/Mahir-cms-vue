<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLeaveRules } from "../composables/useLeaveRules";
import { useLeaveRuleForm } from "../composables/useLeaveRuleForm";
import LeaveRuleToolbar from "../components/LeaveRuleToolbar.vue";
import LeaveRuleTable from "../components/LeaveRuleTable.vue";
import LeaveRuleFormModal from "../components/LeaveRuleFormModal.vue";
import ConfirmDialog from "@/shared/components/ConfirmDialog.vue";

const router = useRouter();
const { leaveRules, pagination, loading, nextPage, prevPage, refetch } = useLeaveRules();
const { createLeaveRule, editLeaveRule, deleteLeaveRule, loading: saving } = useLeaveRuleForm();

const modalOpen = ref(false);
// Aturan cuti yang sedang diubah (diprefill via getLeaveRule di dalam modal).
const editing = ref(null);

function openAdd() {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(rule) {
  editing.value = rule;
  modalOpen.value = true;
}

function handleDetail(rule) {
  router.push({ name: "aturan-cuti-detail", params: { id: rule.id } });
}

async function handleSave({ id, input }) {
  const result = id ? await editLeaveRule(id, input) : await createLeaveRule(input);
  if (result) {
    modalOpen.value = false;
    refetch();
  }
}

// Hapus: tampung target lalu konfirmasi dulu sebelum eksekusi.
const confirmOpen = ref(false);
const deleteTarget = ref(null);

const deleteMessage = computed(
  () =>
    `Hapus aturan cuti "${deleteTarget.value?.leaveType?.name ?? ''}" (${deleteTarget.value?.company?.name ?? '—'})? Tindakan ini dapat memengaruhi data terkait.`,
);

function openDelete(rule) {
  deleteTarget.value = rule;
  confirmOpen.value = true;
}

async function handleDelete() {
  if (!deleteTarget.value) return;
  const ok = await deleteLeaveRule(deleteTarget.value.id);
  if (ok) {
    confirmOpen.value = false;
    deleteTarget.value = null;
    refetch();
  }
}
</script>

<template>
  <!-- Table card -->
  <div class="overflow-hidden rounded-2xl border border-mahir-border bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5">
      <h2 class="font-semibold text-slate-900">
        Daftar Aturan Cuti
        <span class="ml-1 text-[13px] font-normal text-slate-400">{{ pagination.count }}</span>
      </h2>
      <LeaveRuleToolbar @add="openAdd" />
    </div>

    <LeaveRuleTable
      :leave-rules="leaveRules"
      :loading="loading"
      @detail="handleDetail"
      @edit="openEdit"
      @delete="openDelete"
    />

    <!-- Footer / pagination -->
    <div class="flex items-center justify-between border-t border-mahir-border px-5 py-3">
      <span class="text-[13px] text-mahir-muted"
        >Menampilkan {{ leaveRules.length }} dari {{ pagination.count }} aturan cuti</span
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

  <!-- Modal tambah/ubah aturan cuti -->
  <LeaveRuleFormModal
    v-model:open="modalOpen"
    :saving="saving"
    :leave-rule="editing"
    @save="handleSave"
  />

  <!-- Konfirmasi hapus -->
  <ConfirmDialog
    v-model:open="confirmOpen"
    title="Hapus Aturan Cuti"
    :message="deleteMessage"
    confirm-text="Ya, Hapus"
    :loading="saving"
    @confirm="handleDelete"
  />
</template>
