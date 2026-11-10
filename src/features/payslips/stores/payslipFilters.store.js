import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination daftar slip gaji — selaras dengan PayslipParams.
export const usePayslipFiltersStore = defineStore("payslipFilters", () => {
  // `search` pada listPayslip tak mem-filter nama; filter nama diresolusi ke
  // daftar id karyawan (employeeIds), seperti pola potongan gaji.
  const employeeIds = ref([]);
  const periodEndFrom = ref(""); // "YYYY-MM-DD"
  const periodEndTo = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    employeeIds.value = [];
    periodEndFrom.value = "";
    periodEndTo.value = "";
    page.value = 1;
  }

  return { employeeIds, periodEndFrom, periodEndTo, page, pageSize, reset };
});
