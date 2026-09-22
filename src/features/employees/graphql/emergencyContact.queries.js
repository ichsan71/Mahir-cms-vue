import gql from "graphql-tag";

// Kontak darurat milik satu karyawan (tab "Kontak Darurat" di detail karyawan).
// Difilter via `params.employeeIds` = [id karyawan yang sedang dibuka].
export const LIST_EMPLOYEE_EMERGENCY_CONTACT = gql`
  query ListEmployeeEmergencyContact($params: EmployeeEmergencyContactParams) {
    listEmployeeEmergencyContact(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          name
          relationship
          phone
          alternatePhone
          address
          isPrimary
        }
      }
    }
  }
`;

// Tambah kontak darurat. `input` (EmployeeEmergencyContactInput): employeeId,
// name, relationship, phone, alternatePhone, address, isPrimary.
export const CREATE_EMPLOYEE_EMERGENCY_CONTACT = gql`
  mutation CreateEmployeeEmergencyContact($input: EmployeeEmergencyContactInput!) {
    createEmployeeEmergencyContact(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah satu kontak darurat. `id` = id record (dari baris list).
export const EDIT_EMPLOYEE_EMERGENCY_CONTACT = gql`
  mutation EditEmployeeEmergencyContact($input: EmployeeEmergencyContactInput!, $id: Int!) {
    editEmployeeEmergencyContact(input: $input, id: $id) {
      data {
        id
      }
    }
  }
`;

// Hapus kontak darurat (soft delete).
export const DELETE_EMPLOYEE_EMERGENCY_CONTACT = gql`
  mutation DeleteEmployeeEmergencyContact($id: Int!, $hard: Boolean!) {
    deleteEmployeeEmergencyContact(id: $id, hard: $hard) {
      data
    }
  }
`;
