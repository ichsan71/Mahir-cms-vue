import gql from "graphql-tag";

// Pilihan infrastruktur via query `infraChoices(group)` — reusable untuk pilihan
// berbasis enum infra (mis. APP_NAME, CHANGE_TYPE, CHANGE_LOG_PLATFORM).
// `group` bertipe InfraChoiceGroup!, mengembalikan [{ value, label }].
export const INFRA_CHOICES = gql`
  query InfraChoices($group: InfraChoiceGroup!) {
    infraChoices(group: $group)
  }
`;
