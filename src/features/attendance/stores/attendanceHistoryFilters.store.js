import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination riwayat kehadiran — selaras dengan
// AttendanceHistoryParams. `employeeIds` TIDAK di sini — diturunkan dari akun
// login (employee + childrens) di composable.
// snapshotDateGte/Lte = rentang tanggal snapshot ("YYYY-MM-DD").
export const useAttendanceHistoryFiltersStore = defineStore("attendanceHistoryFilters", () => {
  const search = ref("");
  const snapshotDateGte = ref(""); // "" = tanpa batas bawah
  const snapshotDateLte = ref(""); // "" = tanpa batas atas
  const status = ref(""); // "" = semua status
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    snapshotDateGte.value = "";
    snapshotDateLte.value = "";
    status.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, snapshotDateGte, snapshotDateLte, status, page, pageSize, reset, setPage };
});
