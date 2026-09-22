import gql from "graphql-tag";

// BPJS bersifat 1:1 per karyawan — datanya dibaca dari `employee.bpjs`
// (lihat GET_EMPLOYEE). Di sini hanya mutasi tambah & ubah.
// `input` (EmployeeBPJSInput): employeeId, kesehatanNumber, kesehatanClass,
// kesehatanRegisteredDate, ketenagakerjaanNumber, ketenagakerjaanRegisteredDate, notes.
export const CREATE_EMPLOYEE_BPJS = gql`
  mutation CreateEmployeeBpjs($input: EmployeeBPJSInput!) {
    createEmployeeBpjs(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah data BPJS. `id` = id record BPJS (dari employee.bpjs.id).
export const EDIT_EMPLOYEE_BPJS = gql`
  mutation EditEmployeeBpjs($input: EmployeeBPJSInput!, $id: Int!) {
    editEmployeeBpjs(input: $input, id: $id) {
      data {
        id
      }
    }
  }
`;
