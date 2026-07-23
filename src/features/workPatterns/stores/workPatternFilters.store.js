import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination pola kerja — selaras dengan WorkPatternParams backend.
export const useWorkPatternFiltersStore = defineStore("workPatternFilters", () => {
  const search = ref("");
  const companyName = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    companyName.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, companyName, page, pageSize, reset, setPage };
});
