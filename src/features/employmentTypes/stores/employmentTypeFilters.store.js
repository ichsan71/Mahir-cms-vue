import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination tipe kepegawaian — selaras dengan EmploymentTypeParams.
export const useEmploymentTypeFiltersStore = defineStore("employmentTypeFilters", () => {
  const search = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, page, pageSize, reset, setPage };
});
