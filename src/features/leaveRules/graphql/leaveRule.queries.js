import gql from "graphql-tag";

// Daftar aturan cuti (leave rule) paginated sesuai kontrak backend.
// `params` (LeaveRuleParams) opsional: page, pageSize, search.
// Tiap aturan terkait satu `leaveType` & bisa beberapa `companies` (list).
export const LIST_LEAVE_RULE = gql`
  query ListLeaveRule($params: LeaveRuleParams) {
    listLeaveRule(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          companies {
            id
            name
          }
          leaveType {
            id
            name
          }
          daysPerYear
          minServiceMonth
          minimumNoticeDays
          maxConsecutiveDays
          allowHalfDay
          allowCarryForward
          maxCarryForward
          carryForwardExpireAfterMonths
          allowNegativeBalance
        }
      }
    }
  }
`;

// Detail satu aturan cuti untuk halaman profil & prefill edit.
// `leaveType { id name }` ditambahkan (tidak ada di query asli) agar pemilih
// tipe cuti bisa di-prefill saat edit.
export const GET_LEAVE_RULE = gql`
  query GetLeaveRule($getLeaveRuleId: Int!) {
    getLeaveRule(id: $getLeaveRuleId) {
      data {
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
        companies {
          id
          name
        }
        leaveType {
          id
          name
        }
      }
    }
  }
`;

// Tambah aturan cuti. `input` (LeaveRuleInput):
// companyIds([Int]), leaveTypeId(Int), daysPerYear(Float), minServiceMonth(Int),
// minimumNoticeDays(Int), maxConsecutiveDays(Int), allowHalfDay(Bool),
// allowCarryForward(Bool), maxCarryForward(Float), carryForwardExpireAfterMonths(Int),
// allowNegativeBalance(Bool).
export const CREATE_LEAVE_RULE = gql`
  mutation CreateLeaveRule($input: LeaveRuleInput!) {
    createLeaveRule(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah aturan cuti yang ada. `editLeaveRuleId` adalah id aturan.
export const EDIT_LEAVE_RULE = gql`
  mutation EditLeaveRule($input: LeaveRuleInput!, $editLeaveRuleId: Int!) {
    editLeaveRule(input: $input, id: $editLeaveRuleId) {
      data {
        id
      }
    }
  }
`;

// Hapus aturan cuti. `hard` selalu false (soft delete) sesuai kebijakan —
// mengikuti pola mutasi delete fitur lain.
export const DELETE_LEAVE_RULE = gql`
  mutation DeleteLeaveRule($deleteLeaveRuleId: Int!, $hard: Boolean!) {
    deleteLeaveRule(id: $deleteLeaveRuleId, hard: $hard) {
      data
    }
  }
`;
