import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination komponen penggajian — selaras dengan SalaryComponentTypeParams.
export const useSalaryComponentTypeFiltersStore = defineStore("salaryComponentTypeFilters", () => {
  const search = ref("");
  const category = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    category.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, category, page, pageSize, reset, setPage };
});
