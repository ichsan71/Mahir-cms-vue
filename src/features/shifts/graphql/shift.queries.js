import gql from "graphql-tag";

// Daftar shift (paginated) sesuai kontrak backend nyata.
// `params` (ShiftParams) opsional: page, pageSize, search, name.
export const LIST_SHIFT = gql`
  query ListShift($params: ShiftParams) {
    listShift(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
          startTime
          endTime
        }
      }
    }
  }
`;

// Detail satu shift untuk halaman profil.
export const GET_SHIFT = gql`
  query GetShift($getShiftId: Int!) {
    getShift(id: $getShiftId) {
      data {
        id
        name
        code
        startTime
        endTime
        breakStart
        breakEnd
        requiredHours
        requiredHoursPeriod
        flexibleByPlace
        flexibleByWorkingHours
      }
    }
  }
`;

// Tambah shift baru.
// `input` mengikuti ShiftInput: name, startTime, endTime, breakStart, breakEnd,
// flexibleByPlace, flexibleByWorkingHours, requiredHours, requiredHoursPeriod.
export const CREATE_SHIFT = gql`
  mutation CreateShift($input: ShiftInput!) {
    createShift(input: $input) {
      data {
        name
      }
    }
  }
`;

// Ubah shift yang ada. `editShiftId` adalah id shift.
// `input` mengikuti ShiftInput yang sama seperti CREATE_SHIFT.
export const EDIT_SHIFT = gql`
  mutation EditShift($input: ShiftInput!, $editShiftId: Int!) {
    editShift(input: $input, id: $editShiftId) {
      data {
        name
      }
    }
  }
`;

// Hapus shift. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_SHIFT = gql`
  mutation DeleteShift($deleteShiftId: Int!, $hard: Boolean!) {
    deleteShift(id: $deleteShiftId, hard: $hard) {
      data
    }
  }
`;
