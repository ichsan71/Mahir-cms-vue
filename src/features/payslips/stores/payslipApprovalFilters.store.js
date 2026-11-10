import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination inbox persetujuan slip — selaras PayslipApprovalParams.
export const usePayslipApprovalFiltersStore = defineStore("payslipApprovalFilters", () => {
  const status = ref(""); // "" | WAITING | PENDING | APPROVED | REJECTED
  const employeeIds = ref([]);
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    status.value = "";
    employeeIds.value = [];
    page.value = 1;
  }

  return { status, employeeIds, page, pageSize, reset };
});
