/**
 * Kunci permission fitur Izin di Jam Kerja (LeaveAtWorkHour) — tiap nilai adalah
 * nama operasi GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listLeaveAtWorkHour",
  GET: "getLeaveAtWorkHour",
  CREATE: "createLeaveAtWorkHour",
  EDIT: "editLeaveAtWorkHour",
  DELETE: "deleteLeaveAtWorkHour",
  APPROVE: "approveLeaveAtWorkHour",
  REJECT: "rejectLeaveAtWorkHour",
  // Daftar tugas persetujuan (tab Persetujuan).
  APPROVAL_LIST: "listLeaveAtWorkHourApproval",
};
