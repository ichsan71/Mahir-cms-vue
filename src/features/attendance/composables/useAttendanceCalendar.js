import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { LIST_ATTENDANCE } from "../graphql/attendance.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Format Date lokal → "YYYY-MM-DD" (tanpa efek zona waktu dari toISOString).
function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Kunci tanggal dari nilai record ("2026-07-15" atau ISO) → "YYYY-MM-DD".
function dateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : ymd(d);
}

// Layer logika kalender kehadiran (khusus scope diri sendiri). Mengambil seluruh
// catatan pada satu bulan untuk employee login, lalu memetakannya ke grid 6x7.
export function useAttendanceCalendar() {
  const auth = useAuthStore();

  // Kursor bulan aktif (selalu tanggal 1 pukul lokal).
  const now = new Date();
  const cursor = ref(new Date(now.getFullYear(), now.getMonth(), 1));

  const monthStart = computed(() => ymd(new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1)));
  const monthEnd = computed(() => ymd(new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0)));

  const { result, loading } = useQuery(
    LIST_ATTENDANCE,
    () => ({
      params: {
        page: 1,
        pageSize: 50, // cukup untuk 1 bulan 1 karyawan
        employeeId: auth.employee?.id ?? null,
        dateGte: monthStart.value,
        dateLte: monthEnd.value,
      },
    }),
    { fetchPolicy: "cache-and-network" },
  );

  const records = computed(() => result.value?.listAttendance?.data?.results ?? []);

  // Peta "YYYY-MM-DD" → record (untuk lookup cepat per sel kalender).
  const byDate = computed(() => {
    const map = new Map();
    for (const r of records.value) {
      const k = dateKey(r.date);
      if (k) map.set(k, r);
    }
    return map;
  });

  const todayKey = ymd(new Date());

  // Grid 6 minggu × 7 hari, mulai Senin. Sel di luar bulan ditandai inMonth=false.
  const weeks = computed(() => {
    const year = cursor.value.getFullYear();
    const month = cursor.value.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // jarak hari dari Senin
    const gridStart = new Date(year, month, 1 - startOffset);

    const out = [];
    for (let w = 0; w < 6; w += 1) {
      const days = [];
      for (let d = 0; d < 7; d += 1) {
        const cur = new Date(gridStart);
        cur.setDate(gridStart.getDate() + w * 7 + d);
        const key = ymd(cur);
        const dow = cur.getDay(); // 0=Minggu, 6=Sabtu
        days.push({
          key,
          day: cur.getDate(),
          inMonth: cur.getMonth() === month,
          isToday: key === todayKey,
          weekend: dow === 0 || dow === 6,
          record: byDate.value.get(key) || null,
        });
      }
      out.push(days);
    }
    return out;
  });

  // Ringkasan status untuk bulan aktif.
  const summary = computed(() => {
    const acc = { ontime: 0, late: 0, absent: 0, leave: 0 };
    for (const r of records.value) {
      const k = String(r.status ?? "").toLowerCase();
      if (k in acc) acc[k] += 1;
    }
    return acc;
  });

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(cursor.value),
  );

  function prevMonth() {
    cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1);
  }
  function nextMonth() {
    cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1);
  }
  function goToday() {
    const t = new Date();
    cursor.value = new Date(t.getFullYear(), t.getMonth(), 1);
  }

  return { weeks, summary, monthLabel, loading, prevMonth, nextMonth, goToday };
}
