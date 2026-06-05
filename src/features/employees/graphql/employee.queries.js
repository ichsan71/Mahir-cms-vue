import gql from "graphql-tag";

// Daftar karyawan dengan filter pencarian / departemen / status
export const EMPLOYEES = gql`
  query Employees($search: String, $dept: String, $status: String) {
    employees(search: $search, dept: $dept, status: $status) {
      id
      name
      email
      phone
      dept
      position
      join
      status
    }
  }
`;

// Statistik 4 kartu di halaman karyawan
export const EMPLOYEE_STATS = gql`
  query EmployeeStats {
    employeeStats {
      total
      active
      inactive
      departments
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

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;
