import { defineStore } from "pinia";
import { ref } from "vue";

// State filter & pagination pengumuman — selaras dengan AnnouncementParams.
// `title` = kata kunci judul; status = AnnouncementStatusChoices ("" = semua);
// companyIds/unitIds = filter tujuan (array id).
export const useAnnouncementFiltersStore = defineStore("announcementFilters", () => {
  const title = ref("");
  const status = ref("");
  const companyIds = ref([]);
  const unitIds = ref([]);
  const page = ref(1);
  const pageSize = ref(10);

  function reset() {
    title.value = "";
    status.value = "";
    companyIds.value = [];
    unitIds.value = [];
    page.value = 1;
  }

  function setPage(p) {
    page.value = p;
  }

  return { title, status, companyIds, unitIds, page, pageSize, reset, setPage };
});
