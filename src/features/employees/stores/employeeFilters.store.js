import { defineStore } from "pinia";
import { ref } from "vue";

// State filter karyawan — di-share antara EmployeeToolbar dan EmployeeTable/View.
export const useEmployeeFiltersStore = defineStore("employeeFilters", () => {
  const search = ref("");
  const dept = ref("");
  const status = ref("");

  function reset() {
    search.value = "";
    dept.value = "";
    status.value = "";
  }

  return { search, dept, status, reset };
});
