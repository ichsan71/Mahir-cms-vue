import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { TODAY_ATTENDANCE } from "../graphql/attendance.queries";
import { useAuthStore } from "@/features/auth/stores/auth.store";

// Tanggal lokal "YYYY-MM-DD" (tanpa efek zona waktu dari toISOString).
function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Ambil "HH:MM" langsung dari string tanggal-waktu backend
// ("2026-08-12 08:24:35...+07:00") tanpa konversi zona waktu — tetap tampil WIB.
function hhmm(value) {
  if (typeof value !== "string" || value.length < 16) return "";
  return value.slice(11, 16);
}

// Status kehadiran HARI INI untuk akun login: sudah absen masuk/pulang, jam,
// serta apakah terlambat / pulang cepat. Diturunkan dari record listAttendance
// hari ini + urutan `logs` (tap paling awal = masuk, tap terakhir = pulang).
export function useTodayAttendance() {
  const auth = useAuthStore();
  const employeeId = computed(() => auth.employee?.id ?? null);
  const today = todayYmd();

  const { result, loading, refetch } = useQuery(
    TODAY_ATTENDANCE,
    () => ({ params: { dateGte: today, dateLte: today, employeeId: employeeId.value } }),
    () => ({ enabled: employeeId.value != null, fetchPolicy: "cache-and-network" }),
  );

  const record = computed(() => result.value?.listAttendance?.data?.results?.[0] ?? null);

  // Bedakan masuk/pulang dari `attendanceType` log (IN/OUT), bukan sekadar urutan.
  // Masuk = tap IN paling awal; Pulang = tap OUT paling akhir.
  function timesByType(type) {
    return (record.value?.logs ?? [])
      .filter((l) => l?.timestamp && String(l.attendanceType).toUpperCase() === type)
      .map((l) => String(l.timestamp))
      .sort((a, b) => a.localeCompare(b));
  }

  const inTimes = computed(() => timesByType("IN"));
  const outTimes = computed(() => timesByType("OUT"));

  const hasCheckedIn = computed(() => inTimes.value.length > 0);
  const hasCheckedOut = computed(() => outTimes.value.length > 0);
  const checkInAt = computed(() => hhmm(inTimes.value[0]));
  const checkOutAt = computed(() => hhmm(outTimes.value[outTimes.value.length - 1]));

  const lateSeconds = computed(() => Number(record.value?.lateSeconds) || 0);
  const isLate = computed(() => lateSeconds.value > 0);
  const lateMinutes = computed(() => Math.round(lateSeconds.value / 60));

  const earlyLeaveSeconds = computed(() => Number(record.value?.earlyLeaveSeconds) || 0);
  const isEarlyLeave = computed(() => earlyLeaveSeconds.value > 0);
  const earlyLeaveMinutes = computed(() => Math.round(earlyLeaveSeconds.value / 60));

  const status = computed(() => record.value?.status ?? null);
  const holiday = computed(() => record.value?.holiday ?? null);
  const scheduledIn = computed(() => hhmm(record.value?.scheduledCheckIn));
  const scheduledOut = computed(() => hhmm(record.value?.scheduledCheckOut));

  return {
    record,
    loading,
    refetch,
    hasCheckedIn,
    hasCheckedOut,
    checkInAt,
    checkOutAt,
    isLate,
    lateMinutes,
    isEarlyLeave,
    earlyLeaveMinutes,
    status,
    holiday,
    scheduledIn,
    scheduledOut,
  };
}
