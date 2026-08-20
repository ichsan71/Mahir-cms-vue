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
          childrens {
            id
            fullName
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

// Minta tautan reset password: user cukup kirim email, sisanya diurus backend
// (kirim email berisi tautan). Mengembalikan { detail, success }.
export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      data {
        detail
        success
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
