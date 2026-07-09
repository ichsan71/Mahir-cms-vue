import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination level — selaras dengan LevelParams backend.
// Di-share antara LevelToolbar dan LevelsView/LevelTable.
export const useLevelFiltersStore = defineStore("levelFilters", () => {
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
