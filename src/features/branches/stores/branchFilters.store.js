import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination cabang — selaras dengan BranchParams backend.
export const useBranchFiltersStore = defineStore("branchFilters", () => {
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
