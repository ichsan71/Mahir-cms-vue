/**
 * Kunci permission fitur Slip Gaji (payslip) — tiap nilai adalah nama operasi
 * GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  // Slip gaji
  LIST: "listPayslip",
  GET: "getPayslip",
  GENERATE: "generatePayslip",
  SUBMIT: "submitPayslip",
  RESTORE: "restorePayslip",
  EXPORT: "exportPayslip",
  // Item slip (penyesuaian / line-item)
  ITEM_LIST: "listPayslipItem",
  ITEM_CREATE: "createPayslipItem",
  ITEM_EDIT: "editPayslipItem",
  ITEM_DELETE: "deletePayslipItem",
  // Persetujuan slip gaji
  LIST_APPROVAL: "listPayslipApproval",
  GET_APPROVAL: "getPayslipApproval",
  APPROVE: "approvePayslip",
  REJECT: "rejectPayslip",
  APPROVE_MANY: "approvePayslipMany",
  REJECT_MANY: "rejectPayslipMany",
};
