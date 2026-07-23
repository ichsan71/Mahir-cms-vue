import gql from "graphql-tag";

// Daftar saldo cuti (leave balance) paginated sesuai kontrak backend.
// Saldo per karyawan per tipe cuti per tahun: allocated/used/remaining.
// `params` (LeaveBalanceParams): page, pageSize, search, year, employeeId,
// employeeIds, leaveTypeIds, companyIds. `employeeId` diisi dari akun login.
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
