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
  // Ekspor data karyawan ke email (proses async di backend).
  EXPORT: "exportEmployee",
  // Kirim ulang email verifikasi untuk user yang belum aktif.
  RESEND_VERIFICATION: "resendVerificationEmail",
  // Alamat karyawan (dikelola di halaman detail karyawan).
  ADDRESS_CREATE: "createEmployeeAddress",
  ADDRESS_EDIT: "editEmployeeAddress",
  ADDRESS_DELETE: "deleteEmployeeAddress",
  // Hak akses (tab Hak Akses di detail karyawan): melihat katalog group & menyetel group user.
  GROUP_LIST: "listGroup",
  GROUP_SET: "setUserGroups",
  // Saldo cuti (tab Saldo Cuti di detail karyawan): melihat, menambah & mengubah saldo cuti karyawan.
  BALANCE_LIST: "listLeaveBalance",
  BALANCE_CREATE: "createLeaveBalance",
  BALANCE_EDIT: "editLeaveBalance",
  // Struktur gaji (tab Struktur Gaji di detail karyawan): melihat, menambah, mengubah & menghapus.
  SALARY_LIST: "listEmployeeSalary",
  SALARY_CREATE: "createEmployeeSalary",
  SALARY_EDIT: "editEmployeeSalary",
  SALARY_DELETE: "deleteEmployeeSalary",
  // Rekening bank (tab Rekening Bank di detail karyawan).
  BANK_LIST: "listEmployeeBankAccount",
  BANK_CREATE: "createEmployeeBankAccount",
  BANK_EDIT: "editEmployeeBankAccount",
  BANK_DELETE: "deleteEmployeeBankAccount",
  // BPJS (tab BPJS di detail karyawan) — data 1:1 per karyawan.
  BPJS_LIST: "listEmployeeBpjs",
  BPJS_CREATE: "createEmployeeBpjs",
  BPJS_EDIT: "editEmployeeBpjs",
  // Info pajak (tab Pajak di detail karyawan) — data 1:1 per karyawan.
  TAX_LIST: "listEmployeeTaxInfo",
  TAX_CREATE: "createEmployeeTaxInfo",
  TAX_EDIT: "editEmployeeTaxInfo",
  TAX_DELETE: "deleteEmployeeTaxInfo",
  // Kontak darurat (tab Kontak Darurat di detail karyawan).
  EMERGENCY_LIST: "listEmployeeEmergencyContact",
  EMERGENCY_CREATE: "createEmployeeEmergencyContact",
  EMERGENCY_EDIT: "editEmployeeEmergencyContact",
  EMERGENCY_DELETE: "deleteEmployeeEmergencyContact",
  // Anggota keluarga (tab Keluarga di detail karyawan).
  FAMILY_LIST: "listEmployeeFamilyMember",
  FAMILY_CREATE: "createEmployeeFamilyMember",
  FAMILY_EDIT: "editEmployeeFamilyMember",
  FAMILY_DELETE: "deleteEmployeeFamilyMember",
};
