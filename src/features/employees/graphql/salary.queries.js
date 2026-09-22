import gql from "graphql-tag";

// Struktur gaji milik satu karyawan (tab "Struktur Gaji" di detail karyawan).
// Difilter via `params.employeeIds` = [id karyawan yang sedang dibuka].
// `components.componentType { id }` diperlukan untuk prefill saat edit.
export const LIST_EMPLOYEE_SALARY = gql`
  query ListEmployeeSalary($params: EmployeeSalaryParams) {
    listEmployeeSalary(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          effectiveDate
          payPeriod
          currency
          paymentMethod
          isActive
          notes
          takeHome
          components {
            id
            value
            notes
            componentType {
              id
              name
              code
              category
            }
          }
        }
      }
    }
  }
`;

// Tambah struktur gaji baru. `input` (EmployeeSalaryInput): employeeId,
// effectiveDate, payPeriod, currency, paymentMethod, isActive, notes,
// components [{ componentTypeId, value, notes }].
export const CREATE_EMPLOYEE_SALARY = gql`
  mutation CreateEmployeeSalary($input: EmployeeSalaryInput!) {
    createEmployeeSalary(input: $input) {
      data {
        id
        effectiveDate
        takeHome
      }
    }
  }
`;

// Ubah satu struktur gaji. `editEmployeeSalaryId` = id record (dari baris list).
export const EDIT_EMPLOYEE_SALARY = gql`
  mutation EditEmployeeSalary($input: EmployeeSalaryInput!, $editEmployeeSalaryId: Int!) {
    editEmployeeSalary(input: $input, id: $editEmployeeSalaryId) {
      data {
        id
        effectiveDate
        takeHome
      }
    }
  }
`;

// Hapus struktur gaji. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_EMPLOYEE_SALARY = gql`
  mutation DeleteEmployeeSalary($deleteEmployeeSalaryId: Int!, $hard: Boolean!) {
    deleteEmployeeSalary(id: $deleteEmployeeSalaryId, hard: $hard) {
      data
    }
  }
`;
