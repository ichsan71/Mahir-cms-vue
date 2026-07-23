/**
 * Kunci permission fitur Aturan Cuti (Leave Rule) — tiap nilai adalah nama
 * operasi GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listLeaveRule",
  GET: "getLeaveRule",
  CREATE: "createLeaveRule",
  EDIT: "editLeaveRule",
  DELETE: "deleteLeaveRule",
};
