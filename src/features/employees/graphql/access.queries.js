import gql from "graphql-tag";

// Daftar Group (role) beserta permission di dalamnya. Dipakai sebagai katalog
// hak akses pada tab "Hak Akses" karyawan: nama group → judul seksi,
// `permissions` → checkbox. `params` (GroupParams): page, pageSize, search.
export const LIST_GROUP = gql`
  query ListGroup($params: GroupParams) {
    listGroup(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          name
          permissions {
            id
            name
          }
        }
      }
    }
  }
`;

// Setel (ganti seluruh) group milik seorang user. `userId` = id akun user
// (employee.user.id, BUKAN id karyawan), `groupIds` = daftar id group terpilih.
// Bersifat replace: himpunan yang dikirim menjadi group final user tsb.
export const SET_USER_GROUPS = gql`
  mutation SetUserGroups($input: SetUserGroupsInput!) {
    setUserGroups(input: $input) {
      data {
        id
        email
      }
    }
  }
`;
