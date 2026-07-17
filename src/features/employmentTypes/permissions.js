/**
 * Kunci permission fitur Tipe Kepegawaian — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listEmploymentType",
  GET: "getEmploymentType",
  CREATE: "createEmploymentType",
  EDIT: "editEmploymentType",
  DELETE: "deleteEmploymentType",
};
