import gql from "graphql-tag";

// Daftar tipe kepegawaian (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, search, name.
export const LIST_EMPLOYMENT_TYPE = gql`
  query ListEmploymentType($params: EmploymentTypeParams) {
    listEmploymentType(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
        }
      }
    }
  }
`;

// Detail satu tipe kepegawaian untuk halaman profil (termasuk daftar karyawan).
export const GET_EMPLOYMENT_TYPE = gql`
  query GetEmploymentType($getEmploymentTypeId: Int!) {
    getEmploymentType(id: $getEmploymentTypeId) {
      data {
        id
        name
        employees {
          id
          fullName
          level {
            id
            name
          }
          units {
            id
            name
          }
        }
      }
    }
  }
`;

// Tambah tipe kepegawaian baru. `input` mengikuti EmploymentTypeInput: name.
export const CREATE_EMPLOYMENT_TYPE = gql`
  mutation CreateEmploymentType($input: EmploymentTypeInput!) {
    createEmploymentType(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah tipe kepegawaian. `editEmploymentTypeId` adalah id.
export const EDIT_EMPLOYMENT_TYPE = gql`
  mutation EditEmploymentType($input: EmploymentTypeInput!, $editEmploymentTypeId: Int!) {
    editEmploymentType(input: $input, id: $editEmploymentTypeId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus tipe kepegawaian. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_EMPLOYMENT_TYPE = gql`
  mutation DeleteEmploymentType($deleteEmploymentTypeId: Int!, $hard: Boolean!) {
    deleteEmploymentType(id: $deleteEmploymentTypeId, hard: $hard) {
      data
    }
  }
`;
