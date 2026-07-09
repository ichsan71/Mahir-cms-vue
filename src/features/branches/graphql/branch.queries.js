import gql from "graphql-tag";

// Daftar cabang (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, name, search.
export const LIST_BRANCH = gql`
  query ListBranch($params: BranchParams) {
    listBranch(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
          companies {
            id
            name
          }
        }
      }
    }
  }
`;

// Detail satu cabang untuk halaman profil (termasuk karyawan & perusahaan).
export const GET_BRANCH = gql`
  query GetBranch($getBranchId: Int!) {
    getBranch(id: $getBranchId) {
      data {
        id
        name
        employees {
          id
          fullName
        }
        companies {
          id
          name
        }
      }
    }
  }
`;

// Tambah cabang baru. `input` mengikuti BranchInput: name, companyId.
export const CREATE_BRANCH = gql`
  mutation CreateBranch($input: BranchInput!) {
    createBranch(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah cabang yang ada. `editBranchId` adalah id cabang.
export const EDIT_BRANCH = gql`
  mutation EditBranch($input: BranchInput!, $editBranchId: Int!) {
    editBranch(input: $input, id: $editBranchId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus cabang. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_BRANCH = gql`
  mutation DeleteBranch($deleteBranchId: Int!, $hard: Boolean!) {
    deleteBranch(id: $deleteBranchId, hard: $hard) {
      data
    }
  }
`;
