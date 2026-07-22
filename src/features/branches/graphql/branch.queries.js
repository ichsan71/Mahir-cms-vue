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
          address {
            id
            city
            country
            line1
            line2
            state
          }
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
          image
          nik
          level {
            id
            name
          }
          units {
            id
            name
          }
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

// ── Alamat cabang (branch address) ─────────────────────────────────────────

// Daftar alamat cabang (paginated). Filter per cabang lewat `branchName`.
export const LIST_BRANCH_ADDRESS = gql`
  query ListBranchAddress($params: BranchAddressParams) {
    listBranchAddress(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          line1
          line2
          country
          state
          city
          latitude
          longitude
        }
      }
    }
  }
`;

// Tambah alamat cabang. `input` mengikuti BranchAddressInput:
// branchId, city, country, latitude, longitude, line1, line2, state.
export const CREATE_BRANCH_ADDRESS = gql`
  mutation CreateBranchAddress($input: BranchAddressInput!) {
    createBranchAddress(input: $input) {
      data {
        id
        branch {
          name
        }
      }
    }
  }
`;

// Ubah alamat cabang. `editBranchAddressId` adalah id alamat.
export const EDIT_BRANCH_ADDRESS = gql`
  mutation EditBranchAddress($input: BranchAddressInput!, $editBranchAddressId: Int!) {
    editBranchAddress(input: $input, id: $editBranchAddressId) {
      data {
        id
        line1
      }
    }
  }
`;

// Hapus alamat cabang. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_BRANCH_ADDRESS = gql`
  mutation DeleteBranchAddress($deleteBranchAddressId: Int!, $hard: Boolean!) {
    deleteBranchAddress(id: $deleteBranchAddressId, hard: $hard) {
      data
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
