import gql from "graphql-tag";

// Daftar saldo cuti (leave balance) paginated sesuai kontrak backend.
// Saldo per karyawan per tipe cuti per tahun: allocated/used/remaining.
// `params` (LeaveBalanceParams): page, pageSize, search, year, employeeId,
// employeeIds, leaveTypeIds, companyIds. `employeeId` diisi dari akun login.
// Hitung ulang saldo cuti berdasarkan pilihan filter. Semua argumen array Int &
// opsional, nama plural (schema.json introspection keliru menandainya singular
// Int tunggal — backend nyata: employeeIds/leaveTypeIds/companyIds bertipe [Int!]).
// Kosong = tidak memfilter dimensi tsb. Mengembalikan pesan (StrObjectResponse.data).
export const RECALCULATE_LEAVE_BALANCE = gql`
  mutation RecalculateLeaveBalance($employeeIds: [Int!], $leaveTypeIds: [Int!], $companyIds: [Int!]) {
    recalculateLeaveBalance(employeeIds: $employeeIds, leaveTypeIds: $leaveTypeIds, companyIds: $companyIds) {
      data
    }
  }
`;

export const LIST_LEAVE_BALANCE = gql`
  query ListLeaveBalance($params: LeaveBalanceParams) {
    listLeaveBalance(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          year
          allocated
          used
          remaining
          employeeSnapshot
          companySnapshot
          leaveType {
            name
          }
          employee {
            id
            fullName
          }
        }
      }
    }
  }
`;
