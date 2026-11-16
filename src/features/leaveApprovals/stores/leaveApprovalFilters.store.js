import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination persetujuan cuti — selaras dengan LeaveApprovalParams.
export const useLeaveApprovalFiltersStore = defineStore("leaveApprovalFilters", () => {
  const search = ref("");
  // Default "PENDING": tab Persetujuan hanya menampilkan yang butuh persetujuan
  // (difilter di backend). User bisa ganti ke Semua/WAITING/APPROVED/REJECTED.
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
