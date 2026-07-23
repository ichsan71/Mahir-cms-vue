import gql from "graphql-tag";

// Daftar mutasi saldo cuti (ledger) paginated sesuai kontrak backend.
// Tiap baris = satu perubahan saldo: before → after, amount, transactionType,
// terkait `balance` (saldo) dan opsional `leave` (pengajuan pemicunya).
// `params` (LeaveBalanceTransactionParams): page, pageSize, search,
// transactionType, balanceId, balanceIds, leaveId, leaveIds, notId.
export const LIST_LEAVE_BALANCE_TRANSACTION = gql`
  query ListLeaveBalanceTransaction($params: LeaveBalanceTransactionParams) {
    listLeaveBalanceTransaction(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          transactionType
          amount
          before
          after
          description
          balance {
            id
            year
            used
            remaining
            leaveType {
              name
            }
          }
          leave {
            id
            startDate
            endDate
            reason
            status
            totalDays
            leaveType {
              name
            }
          }
        }
      }
    }
  }
`;
