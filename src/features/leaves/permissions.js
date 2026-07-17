/**
 * Kunci permission fitur Cuti & Izin — tiap nilai adalah nama operasi GraphQL
 * yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "leaves",
  STATS: "leaveStats",
  CREATE: "createLeave",
  APPROVE: "approveLeave",
  REJECT: "rejectLeave",
};
