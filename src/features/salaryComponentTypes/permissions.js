/**
 * Kunci permission fitur Komponen Penggajian — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listSalaryComponentType",
  GET: "getSalaryComponentType",
  CREATE: "createSalaryComponentType",
  EDIT: "editSalaryComponentType",
  DELETE: "deleteSalaryComponentType",
};
