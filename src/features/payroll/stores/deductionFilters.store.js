import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination potongan gaji — selaras dengan EmployeeSalaryDeductionParams.
export const useDeductionFiltersStore = defineStore("deductionFilters", () => {
  // Backend `search` pada listEmployeeSalaryDeduction tak mem-filter nama, jadi
  // filter nama diresolusi ke daftar id karyawan (employeeIds).
  const employeeIds = ref([]);
  const periodEndFrom = ref(""); // "YYYY-MM-DD"
  const periodEndTo = ref("");
  const isFinal = ref(""); // "" | "true" | "false"
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    employeeIds.value = [];
    periodEndFrom.value = "";
    periodEndTo.value = "";
    isFinal.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { employeeIds, periodEndFrom, periodEndTo, isFinal, page, pageSize, reset, setPage };
});
