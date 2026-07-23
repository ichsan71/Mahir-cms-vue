import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination mutasi saldo cuti — selaras dengan
// LeaveBalanceTransactionParams.
export const useLeaveBalanceTransactionFiltersStore = defineStore(
  "leaveBalanceTransactionFilters",
  () => {
    const search = ref("");
    const transactionType = ref(""); // "" = semua jenis
    const page = ref(1);
    const pageSize = ref(10);

    function reset() {
      search.value = "";
      transactionType.value = "";
      page.value = 1;
    }

    function setPage(p) {
      page.value = p;
    }

    return { search, transactionType, page, pageSize, reset, setPage };
  },
);
