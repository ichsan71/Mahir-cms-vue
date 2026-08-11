/**
 * Kunci permission fitur Karyawan — tiap nilai adalah nama operasi GraphQL yang
 * di-gate backend (cocok dengan `user.userPermissions`). Pakai dengan
 * `auth.can(PERM.CREATE)` untuk menyembunyikan aksi yang tak boleh dipakai.
 */
export const PERM = {
  LIST: "listEmployee",
  GET: "getEmployee",
  // Struktur organisasi (pohon atasan–bawahan) di dashboard.
  ROOT: "getRootEmployee",
  CREATE: "createEmployee",
  REGISTER: "registerEmployee",
  EDIT: "editEmployee",
  DELETE: "deleteEmployee",
  // Alamat karyawan (dikelola di halaman detail karyawan).
  ADDRESS_CREATE: "createEmployeeAddress",
  ADDRESS_EDIT: "editEmployeeAddress",
  ADDRESS_DELETE: "deleteEmployeeAddress",
  // Hak akses (tab Hak Akses di detail karyawan): melihat katalog group & menyetel group user.
  GROUP_LIST: "listGroup",
  GROUP_SET: "setUserGroups",
};
