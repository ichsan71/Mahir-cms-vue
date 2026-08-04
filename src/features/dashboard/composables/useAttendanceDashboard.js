// Berlangganan (subscription) ringkasan kehadiran realtime untuk dashboard dan
// membentuknya menjadi data siap-pakai: rangkuman hari terbaru + tren harian.
import { computed } from "vue";
import { useSubscription } from "@vue/apollo-composable";
import { ATTENDANCE_DASHBOARD_SUB } from "../graphql/dashboard.queries";

// Urutan & metadata status yang ditampilkan (label Indonesia + warna chart/badge).
export const STATUS_META = {
  PRESENT: { label: "Hadir", color: "#1B9C67", soft: "#E2F8EC" },
  LATE: { label: "Terlambat", color: "#F59E0B", soft: "#FFF3DA" },
  EARLY_LEAVE: { label: "Pulang Cepat", color: "#FB923C", soft: "#FFEDD5" },
  ON_LEAVE: { label: "Cuti / Izin", color: "#3B82F6", soft: "#E0EDFF" },
  PENDING: { label: "Belum Absen", color: "#94A3B8", soft: "#F1F5F9" },
  WEEKEND: { label: "Libur", color: "#CBD5E1", soft: "#F1F5F9" },
};

// Urutan status yang dipakai untuk tumpukan chart & kartu ringkas.
export const STATUS_ORDER = ["PRESENT", "LATE", "EARLY_LEAVE", "ON_LEAVE", "PENDING", "WEEKEND"];

export function useAttendanceDashboard(options = {}) {
  const { result, loading, error } = useSubscription(ATTENDANCE_DASHBOARD_SUB, null, options);

  // Baris mentah dari subscription.
  const histories = computed(() => result.value?.attendanceDashboard?.histories ?? []);

  // Kelompokkan per tanggal → { [date]: { [status]: row } }, urut menaik.
  const byDate = computed(() => {
    const map = new Map();
    for (const row of histories.value) {
      if (!row?.snapshotDate) continue;
      if (!map.has(row.snapshotDate)) map.set(row.snapshotDate, {});
      map.get(row.snapshotDate)[row.status] = row;
    }
    return map;
  });

  // Tanggal terurut menaik.
  const dates = computed(() => [...byDate.value.keys()].sort());

  // Tanggal terbaru (paling akhir).
  const latestDate = computed(() => dates.value[dates.value.length - 1] ?? null);

  // Ringkasan hari terbaru: [{ status, label, color, count, employees }].
  const latestSummary = computed(() => {
    const day = latestDate.value ? byDate.value.get(latestDate.value) : null;
    if (!day) return [];
    return STATUS_ORDER.filter((s) => day[s]).map((status) => {
      const row = day[status];
      return {
        status,
        ...STATUS_META[status],
        count: row.employeeCount ?? 0,
        employees: row.employees ?? [],
      };
    });
  });

  // Total karyawan terpantau pada hari terbaru (untuk konteks persentase).
  const latestTotal = computed(() =>
    latestSummary.value.reduce((sum, s) => sum + (s.count || 0), 0),
  );

  // Data tren harian untuk stacked bar: { labels, datasets } per status.
  const trend = computed(() => {
    const labels = dates.value;
    // Status yang benar-benar muncul di rentang ini (jaga chart tetap ringkas).
    const present = STATUS_ORDER.filter((status) =>
      labels.some((d) => byDate.value.get(d)?.[status]),
    );
    const datasets = present.map((status) => ({
      status,
      label: STATUS_META[status].label,
      color: STATUS_META[status].color,
      data: labels.map((d) => byDate.value.get(d)?.[status]?.employeeCount ?? 0),
    }));
    return { labels, datasets };
  });

  return {
    loading,
    error,
    histories,
    dates,
    latestDate,
    latestSummary,
    latestTotal,
    trend,
  };
}
