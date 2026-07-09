import { defineStore } from "pinia";
import { ref } from "vue";/// State filter & pagination karyawan — selaras dengan EmployeeParams backend.
// Di-share antara EmployeeToolbar dan EmployeesView/EmployeeTable.
export const useEmployeeFiltersStore= defineStore("employeeFilters", () => {
  const search = ref("");
  const fullName = ref("");
  const nik = ref("");
  const unitsName = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    fullName.value = "";
    nik.value = "";
    unitsName.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, fullName, nik, unitsName, page, pageSize, reset, setPage };
});
