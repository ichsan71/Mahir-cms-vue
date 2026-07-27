import gql from "graphql-tag";

// Daftar persetujuan cuti (leave approval) paginated sesuai kontrak backend.
// Tiap baris = satu tugas persetujuan: satu `approver` untuk satu `leave`.
// `params` (LeaveApprovalParams): page, pageSize, search, status
// (LeaveApprovalStatusChoices), plus filter approverIds/leaveId/leaveIds/notId.
export const LIST_LEAVE_APPROVAL = gql`
  query ListLeaveApproval($params: LeaveApprovalParams) {
    listLeaveApproval(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          status
          approver {
            id
            fullName
            level {
              name
            }
          }
          leave {
            id
            attachment
            startDate
            endDate
            reason
            status
            totalDays
            employee {
              fullName
            }
            leaveType {
              name
            }
          }
        }
      }
    }
  }
`;

// Setujui cuti (oleh approver). `id` = id baris LeaveApproval.
export const APPROVE_LEAVE = gql`
  mutation ApproveLeave($approveLeaveId: Int!) {
    approveLeave(id: $approveLeaveId) {
      data {
        id
      }
    }
  }
`;

// Tolak cuti (oleh approver). `id` = id baris LeaveApproval.
export const REJECT_LEAVE = gql`
  mutation RejectLeave($rejectLeaveId: Int!) {
    rejectLeave(id: $rejectLeaveId) {
      data {
        id
      }
    }
  }
`;
