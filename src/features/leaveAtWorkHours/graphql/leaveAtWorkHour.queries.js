import gql from "graphql-tag";

// Daftar izin di jam kerja (leave at work hour) paginated.
// `params` (LeaveAtWorkHourParams): page, pageSize, search, status, employeeId,
// employeeIds, leaveTypeId, leaveTypeIds. `employeeId` diisi dari akun login
// (self-service): karyawan biasa hanya melihat izinnya sendiri.
export const LIST_LEAVE_AT_WORK_HOUR = gql`
  query ListLeaveAtWorkHour($params: LeaveAtWorkHourParams) {
    listLeaveAtWorkHour(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          date
          reason
          attachment
          status
          employee {
            id
            fullName
          }
          leaveType {
            id
            name
          }
        }
      }
    }
  }
`;

// Ajukan izin baru. `input` (LeaveAtWorkHourInput): employeeId, leaveTypeId,
// date, reason, attachment (file, opsional), status (LeaveAtWorkHourStatusChoices).
export const CREATE_LEAVE_AT_WORK_HOUR = gql`
  mutation CreateLeaveAtWorkHour($input: LeaveAtWorkHourInput!) {
    createLeaveAtWorkHour(input: $input) {
      data {
        id
        date
        status
      }
    }
  }
`;

// Daftar tugas persetujuan izin (satu baris = satu approver utk satu izin).
// `params` (LeaveAtWorkHourApprovalParams): approverId (id employee akun login),
// status, leaveAtWorkHourId, dst. Dipakai pada tab "Persetujuan".
export const LIST_LEAVE_AT_WORK_HOUR_APPROVAL = gql`
  query ListLeaveAtWorkHourApproval($params: LeaveAtWorkHourApprovalParams) {
    listLeaveAtWorkHourApproval(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          status
          remark
          order
          approver {
            id
            fullName
          }
          leaveAtWorkHour {
            id
            date
            reason
            attachment
            status
            employee {
              id
              fullName
            }
            leaveType {
              id
              name
            }
          }
        }
      }
    }
  }
`;

// Setujui izin (oleh approver). `id` = id baris LeaveAtWorkHourApproval (dari
// listLeaveAtWorkHourApproval), BUKAN id record izin. `remark` opsional.
export const APPROVE_LEAVE_AT_WORK_HOUR = gql`
  mutation ApproveLeaveAtWorkHour($id: Int!, $remark: String) {
    approveLeaveAtWorkHour(id: $id, remark: $remark) {
      data {
        id
        status
      }
    }
  }
`;

// Tolak izin (oleh approver). `id` = id baris LeaveAtWorkHourApproval. `remark`
// alasan penolakan (opsional).
export const REJECT_LEAVE_AT_WORK_HOUR = gql`
  mutation RejectLeaveAtWorkHour($id: Int!, $remark: String) {
    rejectLeaveAtWorkHour(id: $id, remark: $remark) {
      data {
        id
        status
      }
    }
  }
`;

// Hapus izin (soft delete). Dipakai pembuat untuk membatalkan izinnya sendiri.
export const DELETE_LEAVE_AT_WORK_HOUR = gql`
  mutation DeleteLeaveAtWorkHour($id: Int!, $hard: Boolean!) {
    deleteLeaveAtWorkHour(id: $id, hard: $hard) {
      data
    }
  }
`;
