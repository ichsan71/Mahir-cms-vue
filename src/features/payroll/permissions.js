/**
 * Kunci permission fitur Penggajian — tiap nilai adalah nama operasi GraphQL
 * yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "payrolls",
  STATS: "payrollStats",
  PROCESS: "processPayroll",
  PROCESS_ALL: "processAllPayroll",
};
