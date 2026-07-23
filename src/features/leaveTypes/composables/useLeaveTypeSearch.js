import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_TYPE } from "../graphql/leaveType.queries";

// Pencarian tipe cuti untuk pilihan `leaveTypeId` — reaktif terhadap kata kunci
// via param `search` pada listLeaveType.
export function useLeaveTypeSearch() {
  const search = ref("");

  const { result, loading } = useQuery(
    LIST_LEAVE_TYPE,
    () => ({ params: { search: search.value || null, page: 1, pageSize: 10 } }),
    { fetchPolicy: "cache-and-network" },
  );

  const options = computed(() => result.value?.listLeaveType?.data?.results ?? []);

  function setSearch(q) {
    search.value = q;
  }

  return { options, loading, setSearch };
}
