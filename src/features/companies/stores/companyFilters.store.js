import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination perusahaan — selaras dengan CompanyParams backend.
// Di-share antara CompanyToolbar dan CompaniesView/CompanyTable.
export const useCompanyFiltersStore = defineStore("companyFilters", () => {
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
