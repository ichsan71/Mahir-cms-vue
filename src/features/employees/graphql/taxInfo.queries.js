import gql from "graphql-tag";

// Info pajak bersifat 1:1 per karyawan — datanya dibaca dari `employee.taxInfo`
// (lihat GET_EMPLOYEE). Di sini hanya mutasi tambah & ubah.
// `input` (EmployeeTaxInfoInput): employeeId, npwp, npwpRegisteredDate,
// isNpwpActive, ptkpStatus, taxMethod, ptkpDependents.
export const CREATE_EMPLOYEE_TAX_INFO = gql`
  mutation CreateEmployeeTaxInfo($input: EmployeeTaxInfoInput!) {
    createEmployeeTaxInfo(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah info pajak. `id` = id record (dari employee.taxInfo.id).
export const EDIT_EMPLOYEE_TAX_INFO = gql`
  mutation EditEmployeeTaxInfo($input: EmployeeTaxInfoInput!, $id: Int!) {
    editEmployeeTaxInfo(input: $input, id: $id) {
      data {
        id
      }
    }
  }
`;
