/**
 * Kunci permission fitur Karyawan — tiap nilai adalah nama operasi GraphQL yang
 * di-gate backend (cocok dengan `user.userPermissions`). Pakai dengan
 * `auth.can(PERM.CREATE)` untuk menyembunyikan aksi yang tak boleh dipakai.
 */
export const PERM = {
  LIST: "listEmployee",
  GET: "getEmployee",
  CREATE: "createEmployee",
  REGISTER: "registerEmployee",
  EDIT: "editEmployee",
  DELETE: "deleteEmployee",
};
