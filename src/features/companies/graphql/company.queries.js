import gql from "graphql-tag";

// Daftar perusahaan (paginated) sesuai kontrak backend nyata.
// `params` opsional: page, pageSize, search.
export const LIST_COMPANY = gql`
  query ListCompany($params: CompanyParams) {
    listCompany(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        results {
          id
          name
          website
          logo
          phone
        }
      }
    }
  }
`;

// Detail satu perusahaan untuk halaman profil.
export const GET_COMPANY = gql`
  query GetCompany($getCompanyId: Int!) {
    getCompany(id: $getCompanyId) {
      data {
        id
        legalName
        logo
        name
        phone
        website
        email
        childrens {
          id
          name
        }
        parent {
          id
          name
        }
      }
    }
  }
`;

// Tambah perusahaan baru.
// `input` mengikuti CompanyInput: email, legalName, logo, name, npwp, parentId, phone, website.
export const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CompanyInput!) {
    createCompany(input: $input) {
      data {
        createdAt
        name
      }
    }
  }
`;

// Ubah perusahaan yang ada.
// `input` sama dengan CompanyInput; `editCompanyId` adalah id perusahaan.
export const EDIT_COMPANY = gql`
  mutation EditCompany($input: CompanyInput!, $editCompanyId: Int!) {
    editCompany(input: $input, id: $editCompanyId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus perusahaan. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_COMPANY = gql`
  mutation DeleteCompany($deleteCompanyId: Int!, $hard: Boolean!) {
    deleteCompany(id: $deleteCompanyId, hard: $hard) {
      data
    }
  }
`;
