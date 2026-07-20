import gql from "graphql-tag";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      data {
        employee {
          id
          image
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
          userPermissions
        }
      }
    }
  }
`;

// Ubah password akun yang sedang login. Butuh password lama & baru.
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      data {
        employee {
          id
          fullName
        }
      }
    }
  }
`;

// Logout di sisi server: menginvalidasi token. authLink otomatis membawa header
// `Authorization: Bearer <token>` selama token masih ada di store (dipanggil
// sebelum sesi lokal dibersihkan), atau via context header eksplisit.
export const LOGOUT = gql`
  mutation Logout {
    logout {
      data {
        success
      }
    }
  }
`;
