import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  EMPLOYEES,
  EMPLOYEE_STATS,
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "../graphql/employee.queries";
import { useEmployeeFiltersStore } from "../stores/employeeFilters.store";

// Layer logika karyawan: list (reaktif terhadap filter) + stats + CRUD.
export function useEmployees() {
  const filters = useEmployeeFiltersStore();
  const { search, dept, status } = storeToRefs(filters);

  // Variabel query dibungkus fungsi agar reaktif terhadap perubahan filter.
  const { result, loading, refetch } = useQuery(
    EMPLOYEES,
    () => ({
      search: search.value || null,
      dept: dept.value || null,
      status: status.value || null,
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const { result: statsRes, refetch: refetchStats } = useQuery(EMPLOYEE_STATS);

  const employees = computed(() => result.value?.employees ?? []);
  const stats = computed(() => statsRes.value?.employeeStats ?? null);

  const { mutate: createMut } = useMutation(CREATE_EMPLOYEE);
  const { mutate: updateMut } = useMutation(UPDATE_EMPLOYEE);
  const { mutate: deleteMut } = useMutation(DELETE_EMPLOYEE);

  async function refreshAll() {
    await Promise.all([refetch(), refetchStats()]);
  }

  async function createEmployee(input) {
    await createMut({ input });
    await refreshAll();
  }

  async function updateEmployee(id, input) {
    await updateMut({ id, input });
    await refreshAll();
  }

  async function deleteEmployee(id) {
    await deleteMut({ id });
    await refreshAll();
  }

  return {
    employees,
    stats,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
