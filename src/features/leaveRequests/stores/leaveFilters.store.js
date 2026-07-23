import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination pengajuan cuti (leave) — selaras dengan LeaveParams.
export const useLeaveFiltersStore = defineStore("leaveFilters", () => {
  const search = ref("");
  const status = ref(""); // LeaveStatusChoices, "" = semua
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    status.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, status, page, pageSize, reset, setPage };
});
