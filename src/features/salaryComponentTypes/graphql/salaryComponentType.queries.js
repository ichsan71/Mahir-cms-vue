import gql from "graphql-tag";

// Daftar jenis komponen penggajian (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, search, code, category, isActive.
export const LIST_SALARY_COMPONENT_TYPE = gql`
  query ListSalaryComponentType($params: SalaryComponentTypeParams) {
    listSalaryComponentType(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
          code
          category
          isTaxable
          isFixed
          isProrated
          forfeitIfLateMinutes
          isActive
        }
      }
    }
  }
`;

// Tambah jenis komponen. `input` mengikuti SalaryComponentTypeInput.
export const CREATE_SALARY_COMPONENT_TYPE = gql`
  mutation CreateSalaryComponentType($input: SalaryComponentTypeInput!) {
    createSalaryComponentType(input: $input) {
      data {
        id
        name
        code
      }
    }
  }
`;

// Ubah jenis komponen. `editSalaryComponentTypeId` adalah id.
export const EDIT_SALARY_COMPONENT_TYPE = gql`
  mutation EditSalaryComponentType($input: SalaryComponentTypeInput!, $editSalaryComponentTypeId: Int!) {
    editSalaryComponentType(input: $input, id: $editSalaryComponentTypeId) {
      data {
        id
        name
        code
      }
    }
  }
`;

// Hapus jenis komponen. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_SALARY_COMPONENT_TYPE = gql`
  mutation DeleteSalaryComponentType($deleteSalaryComponentTypeId: Int!, $hard: Boolean!) {
    deleteSalaryComponentType(id: $deleteSalaryComponentTypeId, hard: $hard) {
      data
    }
  }
`;
