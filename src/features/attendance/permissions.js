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
  // Set/edit kehadiran manual seorang karyawan (jam masuk/keluar). Backend
  // menegakkan izin per-karyawan — tombol hanya tampil bila operasi diizinkan.
  MANUAL_SET: "setManualAttendance",
  // Ekspor data kehadiran ke email (proses async di backend).
  EXPORT: "exportAttendance",
};
