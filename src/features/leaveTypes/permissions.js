/**
 * Kunci permission fitur Tipe Cuti (Leave Type) — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listLeaveType",
  GET: "getLeaveType",
  CREATE: "createLeaveType",
  EDIT: "editLeaveType",
  DELETE: "deleteLeaveType",
};
