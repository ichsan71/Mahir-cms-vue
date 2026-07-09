import gql from "graphql-tag";

// Introspeksi nilai enum dari skema backend — reusable untuk semua pilihan
// berbasis enum (mis. LevelTypeChoices, UnitTypeChoices).
export const ENUM_VALUES = gql`
  query EnumValues($name: String!) {
    __type(name: $name) {
      enumValues {
        name
      }
    }
  }
`;
