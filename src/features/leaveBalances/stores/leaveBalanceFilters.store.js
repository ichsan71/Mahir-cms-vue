import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination saldo cuti — selaras dengan LeaveBalanceParams.
// `employeeId` TIDAK di sini — diambil dari akun login di composable.
export const useLeaveBalanceFiltersStore = defineStore("leaveBalanceFilters", () => {
  const search = ref("");
  const year = ref(""); // "" = semua tahun
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    year.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, year, page, pageSize, reset, setPage };
});
