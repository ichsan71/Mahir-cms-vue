import gql from "graphql-tag";

// Anggota keluarga milik satu karyawan (tab "Keluarga" di detail karyawan).
// Difilter via `params.employeeIds` = [id karyawan yang sedang dibuka].
export const LIST_EMPLOYEE_FAMILY_MEMBER = gql`
  query ListEmployeeFamilyMember($params: EmployeeFamilyMemberParams) {
    listEmployeeFamilyMember(params: $params) {
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
          birthDate
          gender
          nik
          occupation
          isDependent
        }
      }
    }
  }
`;

// Tambah anggota keluarga. `input` (EmployeeFamilyMemberInput): employeeId, name,
// relationship, birthDate, gender, nik, occupation, isDependent.
export const CREATE_EMPLOYEE_FAMILY_MEMBER = gql`
  mutation CreateEmployeeFamilyMember($input: EmployeeFamilyMemberInput!) {
    createEmployeeFamilyMember(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah satu anggota keluarga. `id` = id record (dari baris list).
export const EDIT_EMPLOYEE_FAMILY_MEMBER = gql`
  mutation EditEmployeeFamilyMember($input: EmployeeFamilyMemberInput!, $id: Int!) {
    editEmployeeFamilyMember(input: $input, id: $id) {
      data {
        id
      }
    }
  }
`;

// Hapus anggota keluarga (soft delete).
export const DELETE_EMPLOYEE_FAMILY_MEMBER = gql`
  mutation DeleteEmployeeFamilyMember($id: Int!, $hard: Boolean!) {
    deleteEmployeeFamilyMember(id: $id, hard: $hard) {
      data
    }
  }
`;
