import gql from "graphql-tag";

// Daftar tipe cuti (leave type) paginated sesuai kontrak backend.
// `params` (LeaveTypeParams) opsional: page, pageSize, search.
// Tiap tipe punya banyak `rules` (aturan cuti per perusahaan).
export const LIST_LEAVE_TYPE = gql`
  query ListLeaveType($params: LeaveTypeParams) {
    listLeaveType(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          name
          rules {
            id
            daysPerYear
            minServiceMonth
            allowHalfDay
            allowCarryForward
            maxCarryForward
            carryForwardExpireAfterMonths
            maxConsecutiveDays
            allowNegativeBalance
            minimumNoticeDays
          }
        }
      }
    }
  }
`;

// Detail satu tipe cuti untuk halaman profil & prefill edit.
export const GET_LEAVE_TYPE = gql`
  query GetLeaveType($getLeaveTypeId: Int!) {
    getLeaveType(id: $getLeaveTypeId) {
      data {
        id
        name
        code
        description
        isPaid
        needReason
        needAttachment
        needApproval
        isActive
      }
    }
  }
`;

// Tambah tipe cuti. `input` (LeaveTypeInput) sesuai kontrak: name, isPaid.
export const CREATE_LEAVE_TYPE = gql`
  mutation CreateLeaveType($input: LeaveTypeInput!) {
    createLeaveType(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah tipe cuti yang ada. `editLeaveTypeId` adalah id tipe cuti.
export const EDIT_LEAVE_TYPE = gql`
  mutation EditLeaveType($input: LeaveTypeInput!, $editLeaveTypeId: Int!) {
    editLeaveType(input: $input, id: $editLeaveTypeId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus tipe cuti. `hard` selalu false (soft delete) sesuai kebijakan —
// mengikuti pola mutasi delete fitur lain.
export const DELETE_LEAVE_TYPE = gql`
  mutation DeleteLeaveType($deleteLeaveTypeId: Int!, $hard: Boolean!) {
    deleteLeaveType(id: $deleteLeaveTypeId, hard: $hard) {
      data
    }
  }
`;
