import gql from "graphql-tag";

// Pilihan enum backend via query `choices(group)` — reusable untuk semua pilihan
// berbasis enum (mis. RELIGION, UNIT_TYPE, LEAVE_STATUS).
// `group` bertipe EmployeeChoiceGroup!, mengembalikan [{ value, label }].
export const CHOICES = gql`
  query Choices($group: EmployeeChoiceGroup!) {
    choices(group: $group)
  }
`;
