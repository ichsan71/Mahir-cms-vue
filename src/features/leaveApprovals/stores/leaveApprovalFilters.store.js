import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination persetujuan cuti — selaras dengan LeaveApprovalParams.
export const useLeaveApprovalFiltersStore = defineStore("leaveApprovalFilters", () => {
  const search = ref("");
  const status = ref(""); // LeaveApprovalStatusChoices, "" = semua
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
