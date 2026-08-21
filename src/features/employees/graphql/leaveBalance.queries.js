import gql from "graphql-tag";

// Saldo cuti milik satu karyawan (tab "Saldo Cuti" di detail karyawan).
// Difilter via `params.employeeId` = id karyawan yang sedang dibuka.
// `leaveType { id }` diperlukan untuk prefill select tipe cuti saat edit.
export const LIST_EMPLOYEE_LEAVE_BALANCE = gql`
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
          leaveType {
            id
            name
          }
        }
      }
    }
  }
`;

// Daftar tahun yang tersedia untuk opsi filter (data nyata, bukan hardcode).
// Ambil hanya field `year` semua saldo karyawan (tanpa filter tahun) → distinct
// di sisi klien. Operation name dibedakan agar tidak bentrok dgn query di atas.
export const LIST_EMPLOYEE_LEAVE_BALANCE_YEARS = gql`
  query ListLeaveBalanceYears($params: LeaveBalanceParams) {
    listLeaveBalance(params: $params) {
      data {
        results {
          year
        }
      }
    }
  }
`;

// Tambah saldo cuti baru. `input` (LeaveBalanceInput): employeeId, leaveTypeId,
// year, allocated, used.
export const CREATE_LEAVE_BALANCE = gql`
  mutation CreateLeaveBalance($input: LeaveBalanceInput!) {
    createLeaveBalance(input: $input) {
      data {
        id
        employee {
          fullName
        }
        leaveType {
          name
        }
      }
    }
  }
`;

// Ubah satu saldo cuti. `editLeaveBalanceId` = id record saldo (dari baris list).
// `input` (LeaveBalanceInput): employeeId, leaveTypeId, year, allocated, used.
export const EDIT_LEAVE_BALANCE = gql`
  mutation EditLeaveBalance($input: LeaveBalanceInput!, $editLeaveBalanceId: Int!) {
    editLeaveBalance(input: $input, id: $editLeaveBalanceId) {
      data {
        id
        used
        year
      }
    }
  }
`;
