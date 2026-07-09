import gql from "graphql-tag";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      data {
        employee {
          id
          firstName
          fullName
          lastName
          level {
            id
            name
          }
          units {
            id
            name
          }
        }
        token
        user {
          id
          email
          isStaff
          isActive
          isSuperuser
          username
        }
      }
    }
  }
`;
