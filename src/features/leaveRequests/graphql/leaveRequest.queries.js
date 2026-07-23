import gql from "graphql-tag";

// Daftar pengajuan cuti (leave) paginated. `params` (LeaveParams): page,
// pageSize, search, status, employeeId, leaveTypeId, leaveTypeIds.
// `employeeId` diisi dari akun login (self-service).
export const LIST_LEAVE = gql`
  query ListLeave($params: LeaveParams) {
    listLeave(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          startDate
          endDate
          totalDays
          reason
          status
          attachment
          employee {
            fullName
          }
          leaveType {
            name
          }
          approvals {
            id
            status
            approver {
              id
              fullName
            }
          }
        }
      }
    }
  }
`;

// Kirim pengajuan cuti (DRAFT → masuk alur persetujuan). Dilakukan oleh pengaju.
export const SUBMIT_LEAVE = gql`
  mutation SubmitLeave($submitLeaveId: Int!) {
    submitLeave(id: $submitLeaveId) {
      data {
        id
        status
      }
    }
  }
`;

// Batalkan pengajuan cuti. Hanya berlaku saat status masih DRAFT.
export const CANCEL_LEAVE = gql`
  mutation CancelLeave($cancelLeaveId: Int!) {
    cancelLeave(id: $cancelLeaveId) {
      data {
        id
        status
      }
    }
  }
`;

// Ajukan cuti baru. `input` (LeaveInput): employeeId, leaveTypeId, startDate,
// endDate, totalDays, reason, status (LeaveStatusChoices), attachment (file).
export const CREATE_LEAVE = gql`
  mutation CreateLeave($input: LeaveInput!) {
    createLeave(input: $input) {
      data {
        id
        startDate
        endDate
        reason
        leaveType {
          name
        }
      }
    }
  }
`;
