/**
 * Kunci permission fitur Penggajian (potongan gaji) — tiap nilai adalah nama
 * operasi GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listEmployeeSalaryDeduction",
  GET: "getEmployeeSalaryDeduction",
  COMPUTE: "computeEmployeeSalaryDeduction",
};
