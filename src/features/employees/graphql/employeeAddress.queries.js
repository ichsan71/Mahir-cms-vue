import gql from "graphql-tag";

// Daftar alamat karyawan (paginated). `params` opsional: employeeName, search,
// page, pageSize. Untuk tampilan per-karyawan, alamat sudah ikut di getEmployee
// (employee.addresses); query ini tersedia bila butuh daftar mandiri.
export const LIST_EMPLOYEE_ADDRESS = gql`
  query ListEmployeeAddress($params: EmployeeAddressParams) {
    listEmployeeAddress(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          line1
          line2
          city
          state
          country
        }
      }
    }
  }
`;

// Tambah alamat untuk seorang karyawan. `input.employeeId` menautkan ke karyawan.
export const CREATE_EMPLOYEE_ADDRESS = gql`
  mutation CreateEmployeeAddress($input: EmployeeAddressInput!) {
    createEmployeeAddress(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah alamat yang ada.
export const EDIT_EMPLOYEE_ADDRESS = gql`
  mutation EditEmployeeAddress($editEmployeeAddressId: Int!, $input: EmployeeAddressInput!) {
    editEmployeeAddress(id: $editEmployeeAddressId, input: $input) {
      data {
        id
      }
    }
  }
`;

// Hapus alamat. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_EMPLOYEE_ADDRESS = gql`
  mutation DeleteEmployeeAddress($deleteEmployeeAddressId: Int!, $hard: Boolean!) {
    deleteEmployeeAddress(id: $deleteEmployeeAddressId, hard: $hard) {
      data
    }
  }
`;
