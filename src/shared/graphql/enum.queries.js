import gql from "graphql-tag";

// Pilihan enum backend via query `employeeChoices(group)` — reusable untuk semua pilihan
// berbasis enum (mis. RELIGION, UNIT_TYPE, LEAVE_STATUS).
// `group` bertipe EmployeeChoiceGroup!, mengembalikan [{ value, label }].
export const CHOICES = gql`
  query Query($group: EmployeeChoiceGroup!) {
    employeeChoices(group: $group)
  }
`;
