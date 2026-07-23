/**
 * Kunci permission fitur Pola Kerja (Work Pattern) — tiap nilai adalah nama
 * operasi GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listWorkPattern",
  GET: "getWorkPattern",
  CREATE: "createWorkPattern",
  EDIT: "editWorkPattern",
  DELETE: "deleteWorkPattern",
  // Jadwal harian (details) — mutation terpisah.
  CREATE_DETAIL: "createWorkPatternDetail",
  EDIT_DETAIL: "editWorkPatternDetail",
};
