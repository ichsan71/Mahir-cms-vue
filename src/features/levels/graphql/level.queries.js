import gql from "graphql-tag";

// Daftar level/jabatan (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, search, name.
export const LIST_LEVEL = gql`
  query ListLevel($params: LevelParams) {
    listLevel(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
          parent {
            id
            name
          }
          childrens {
            id
            name
          }
        }
      }
    }
  }
`;

// Detail satu level untuk halaman profil (termasuk daftar karyawan).
export const GET_LEVEL = gql`
  query GetLevel($getLevelId: Int!) {
    getLevel(id: $getLevelId) {
      data {
        id
        name
        employees {
          id
          fullName
          nik
          units {
            id
            name
          }
        }
      }
    }
  }
`;

// Ambil level untuk prefill form edit (nama + induk).
export const GET_LEVEL_FORM = gql`
  query GetLevel($getLevelId: Int!) {
    getLevel(id: $getLevelId) {
      data {
        id
        name
        parent {
          id
          name
        }
      }
    }
  }
`;

// Tambah level baru. `input` mengikuti LevelInput: name, parentId.
export const CREATE_LEVEL = gql`
  mutation CreateLevel($input: LevelInput!) {
    createLevel(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah level yang ada. `editLevelId` adalah id level.
export const EDIT_LEVEL = gql`
  mutation EditLevel($input: LevelInput!, $editLevelId: Int!) {
    editLevel(input: $input, id: $editLevelId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus level. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_LEVEL = gql`
  mutation DeleteLevel($deleteLevelId: Int!, $hard: Boolean!) {
    deleteLevel(id: $deleteLevelId, hard: $hard) {
      data
    }
  }
`;
