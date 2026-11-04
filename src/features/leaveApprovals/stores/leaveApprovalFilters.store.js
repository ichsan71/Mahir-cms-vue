import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination persetujuan cuti — selaras dengan LeaveApprovalParams.
export const useLeaveApprovalFiltersStore = defineStore("leaveApprovalFilters", () => {
  const search = ref("");
  // Default "PENDING": tab Persetujuan hanya menampilkan yang butuh persetujuan.
  // User bisa ganti ke "Semua Status"/APPROVED/REJECTED dari dropdown.
  // Nilai = nama enum LeaveApprovalStatusChoices (dikirim apa adanya ke backend).
  const status = ref("PENDING"); // "" = semua
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    status.value = "PENDING";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, status, page, pageSize, reset, setPage };
});
