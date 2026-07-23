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
            attachment
            startDate
            endDate
            reason
            status
            totalDays
          }
        }
      }
    }
  }
`;
