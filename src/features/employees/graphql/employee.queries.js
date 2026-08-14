import gql from "graphql-tag";

// Daftar karyawan (paginated) sesuai kontrak backend nyata.
// `params` opsional: fullName, unitsName, nik, search, page, pageSize.
export const LIST_EMPLOYEE = gql`
  query ListEmployee($params: EmployeeParams) {
    listEmployee(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          fullName
          image
          code
          nik
          units {
            id
            name
          }
          level {
            id
            name
          }
          hiredDate
          user {
            dateJoined
            id
            isActive
          }
        }
      }
    }
  }
`;

// Detail satu karyawan untuk halaman profil.
export const GET_EMPLOYEE = gql`
  query GetEmployee($getEmployeeId: Int!) {
    getEmployee(id: $getEmployeeId) {
      data {
        id
        nearestResponse {
          id
          fullName
        }
        image
        addresses {
          city
          country
          id
          line1
          line2
          state
        }
        birthDate
        birthPlace
        branch {
          id
          name
        }
        childrens {
          id
          fullName
          nik
        }
        citizenship
        code
        companies {
          id
          name
        }
        description
        employmentType {
          id
          name
        }
        firstName
        fullName
        middleName
        hiredDate
        lastName
        level {
          id
          name
        }
        maritalStatus
        nik
        parent {
          id
          nik
          fullName
        }
        religion
        resignDate
        responses {
          id
          fullName
        }
        roleName
        workPattern {
          id
          name
          details {
            id
            weekday
            weekdayDisplay
            isWorkday
            shift {
              id
              name
              code
              startTime
              endTime
              breakStart
              breakEnd
              requiredHours
              requiredHoursPeriod
              flexibleByPlace
              flexibleByWorkingHours
            }
          }
        }
        talentaId
        units {
          id
          name
        }
        user {
          id
          isActive
          isStaff
          isSuperuser
          email
          username
          groups {
            id
            name
          }
        }
      }
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
    }
  }
`;

// Ubah karyawan yang ada. `editEmployeeId` adalah id karyawan.
export const EDIT_EMPLOYEE = gql`
  mutation EditEmployee($input: EmployeeInput!, $editEmployeeId: Int!) {
    editEmployee(input: $input, id: $editEmployeeId) {
      data {
        id
        fullName
        image
      }
    }
  }
`;

// Hapus karyawan. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($deleteEmployeeId: Int!, $hard: Boolean!) {
    deleteEmployee(id: $deleteEmployeeId, hard: $hard) {
      data
    }
  }
`;

// Daftarkan karyawan baru (sekaligus membuat akun user).
// `username` & `email` di level atas; sisanya di `input` (EmployeeInput).
export const REGISTER_EMPLOYEE = gql`
  mutation RegisterEmployee($username: String!, $email: String!, $input: EmployeeInput!) {
    registerEmployee(username: $username, email: $email, input: $input) {
      data {
        id
        fullName
      }
    }
  }
`;
