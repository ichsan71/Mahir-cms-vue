/**
 * Kunci permission fitur Pengajuan Cuti (Leave) — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listLeave",
  CREATE: "createLeave",
  SUBMIT: "submitLeave",
  CANCEL: "cancelLeave",
};
