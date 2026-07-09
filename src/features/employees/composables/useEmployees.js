import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@vue/apollo-composable";
import { LIST_EMPLOYEE } from "../graphql/employee.queries";
import { useEmployeeFiltersStore } from "../stores/employeeFilters.store";

// Layer logika karyawan: daftar paginated (reaktif terhadap filter & halaman).
export function useEmployees() {
  const filters = useEmployeeFiltersStore();
  const { search, fullName, nik, unitsName, page, pageSize } = storeToRefs(filters);

  // Variabel query dibungkus fungsi agar reaktif terhadap perubahan filter/halaman.
  const { result, loading, refetch } = useQuery(
    LIST_EMPLOYEE,
    () => ({
      params: {
        fullName: fullName.value?.trim() || null,
        unitsName: unitsName.value?.trim() || null,
        nik: nik.value?.trim() || null,
        search: search.value?.trim() || null,
        page: page.value || null,
        pageSize: pageSize.value || null,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const data = computed(() => result.value?.listEmployee?.data ?? null);
  const employees = computed(() => data.value?.results ?? []);
  const pagination = computed(() => ({
    count: data.value?.count ?? 0,
    currentPage: data.value?.currentPage ?? page.value,
    totalPages: data.value?.totalPages ?? 1,
    hasNext: data.value?.hasNext ?? false,
    hasPrev: data.value?.hasPrev ?? false,
  }));

  // Ubah filter → kembali ke halaman pertama agar hasil tetap relevan.
  watch([search, fullName, nik, unitsName, pageSize], () => {
    page.value = 1;
  });

  function nextPage() {
    if (pagination.value.hasNext) page.value += 1;
  }

  function prevPage() {
    if (pagination.value.hasPrev) page.value -= 1;
  }

  function goToPage(p) {
    page.value = p;
  }

  return {
    employees,
    pagination,
    pageSize,
    loading,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  };
}
