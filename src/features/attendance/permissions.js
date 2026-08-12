/**
 * Kunci permission fitur Kehadiran (Attendance) — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listAttendance",
  // Subscription ringkasan kehadiran realtime untuk dashboard.
  DASHBOARD: "attendanceDashboard",
  // Daftar cuti untuk kartu "Cuti Hari Ini".
  LEAVE_LIST: "listLeave",
  // Catat log absen (check-in / check-out).
  LOG_CREATE: "createAttendanceLog",
};
