/**
 * Kunci permission fitur Perusahaan — tiap nilai adalah nama operasi GraphQL yang
 * di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listCompany",
  GET: "getCompany",
  CREATE: "createCompany",
  EDIT: "editCompany",
  DELETE: "deleteCompany",
};
