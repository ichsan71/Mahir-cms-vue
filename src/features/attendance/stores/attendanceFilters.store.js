import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination kehadiran — selaras dengan AttendanceParams.
// `employeeId` TIDAK di sini — diambil dari akun login di composable.
// dateGte/dateLte = rentang tanggal (format "YYYY-MM-DD" dari <input type="date">).
export const useAttendanceFiltersStore = defineStore("attendanceFilters", () => {
  const search = ref("");
  const dateGte = ref(""); // "" = tanpa batas bawah
  const dateLte = ref(""); // "" = tanpa batas atas
  const teamMemberId = ref(""); // "" = semua anggota tim (khusus tab "Kehadiran Tim")
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    dateGte.value = "";
    dateLte.value = "";
    teamMemberId.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, dateGte, dateLte, teamMemberId, page, pageSize, reset, setPage };
});
