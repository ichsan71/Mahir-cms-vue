/**
 * Kunci permission fitur Changelog (ChangeLog) — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listChangeLog",
  GET: "getChangeLog",
  CREATE: "createChangeLog",
  EDIT: "editChangeLog",
  DELETE: "deleteChangeLog",
};
