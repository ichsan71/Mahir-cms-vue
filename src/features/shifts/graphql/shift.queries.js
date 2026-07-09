import gql from "graphql-tag";

// Daftar shift (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, search, name.
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
          startDay
          endDay
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
        startDay
        endDay
        startTime
        endTime
      }
    }
  }
`;

// Tambah shift baru.
// `input` mengikuti ShiftInput: name, startDay, endDay, startTime, endTime.
export const CREATE_SHIFT = gql`
  mutation CreateShift($input: ShiftInput!) {
    createShift(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah shift yang ada. `editShiftId` adalah id shift.
export const EDIT_SHIFT = gql`
  mutation EditShift($input: ShiftInput!, $editShiftId: Int!) {
    editShift(input: $input, id: $editShiftId) {
      data {
        id
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
