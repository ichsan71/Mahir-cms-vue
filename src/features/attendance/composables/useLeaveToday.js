import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_LEAVE_TODAY } from "../graphql/attendance.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PERM } from "../permissions";

// Tanggal lokal (YYYY-MM-DD) tanpa pengaruh timezone dari toISOString.
function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Ambil hanya bagian tanggal (YYYY-MM-DD) dari nilai startDate/endDate backend.
function dateKey(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

// Karyawan yang sedang cuti HARI INI: daftar cuti berstatus APPROVED yang
// rentang tanggalnya (startDate..endDate) mencakup tanggal hari ini.
export function useLeaveToday() {
  const auth = useAuthStore();

  const { result, loading } = useQuery(
    LIST_LEAVE_TODAY,
    { params: { page: 1, pageSize: 50, status: "APPROVED" } },
    () => ({ enabled: auth.can(PERM.LEAVE_LIST), fetchPolicy: "cache-and-network" }),
  );

  const today = localDateKey();

  const items = computed(() => {
    const rows = result.value?.listLeave?.data?.results ?? [];
    return rows.filter((r) => {
      const start = dateKey(r.startDate);
      const end = dateKey(r.endDate) || start;
      if (!start) return false;
      return start <= today && today <= end;
    });
  });

  const count = computed(() => items.value.length);

  return { items, count, loading };
}
