import gql from "graphql-tag";

// Rekening bank milik satu karyawan (tab "Rekening Bank" di detail karyawan).
// Difilter via `params.employeeIds` = [id karyawan yang sedang dibuka].
export const LIST_EMPLOYEE_BANK_ACCOUNT = gql`
  query ListEmployeeBankAccount($params: EmployeeBankAccountParams) {
    listEmployeeBankAccount(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          bankName
          bankCode
          accountNumber
          accountHolderName
          branchName
          isPrimary
        }
      }
    }
  }
`;

// Tambah rekening bank. `input` (EmployeeBankAccountInput): employeeId, bankName,
// accountNumber, accountHolderName, bankCode, branchName, isPrimary.
export const CREATE_EMPLOYEE_BANK_ACCOUNT = gql`
  mutation CreateEmployeeBankAccount($input: EmployeeBankAccountInput!) {
    createEmployeeBankAccount(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah satu rekening bank. `id` = id record (dari baris list).
export const EDIT_EMPLOYEE_BANK_ACCOUNT = gql`
  mutation EditEmployeeBankAccount($input: EmployeeBankAccountInput!, $id: Int!) {
    editEmployeeBankAccount(input: $input, id: $id) {
      data {
        id
      }
    }
  }
`;

// Hapus rekening bank. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_EMPLOYEE_BANK_ACCOUNT = gql`
  mutation DeleteEmployeeBankAccount($id: Int!, $hard: Boolean!) {
    deleteEmployeeBankAccount(id: $id, hard: $hard) {
      data
    }
  }
`;
