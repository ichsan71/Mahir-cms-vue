import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination changelog — selaras dengan ChangeLogParams.
// `search` = kata kunci; platform/changeType = nilai enum dari infraChoices
// ("" = semua). appName dikunci ke "Mahir" di useChangelogs (tanpa filter).
export const useChangelogFiltersStore = defineStore("changelogFilters", () => {
  const search = ref("");
  const platform = ref("");
  const changeType = ref("");
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    search.value = "";
    platform.value = "";
    changeType.value = "";
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { search, platform, changeType, page, pageSize, reset, setPage };
});
