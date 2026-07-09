import gql from "graphql-tag";

// Daftar unit (paginated) sesuai kontrak backend nyata.
// `params` opsional: code, name, page, pageSize, search.
export const LIST_UNIT = gql`
  query ListUnit($params: UnitParams) {
    listUnit(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        results {
          id
          name
          code
          unitType
        }
      }
    }
  }
`;

// Ambil unit untuk prefill form edit (field minimal yang diperlukan form).
export const GET_UNIT_FORM = gql`
  query GetUnit($getUnitId: Int!) {
    getUnit(id: $getUnitId) {
      data {
        id
        name
        unitType
        code
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

// Detail satu unit untuk halaman profil (termasuk pohon hierarki).
export const GET_UNIT = gql`
  query GetUnit($getUnitId: Int!) {
    getUnit(id: $getUnitId) {
      data {
        id
        name
        code
        unitType
        fullCode
        parentTree
        childrenTree
      }
    }
  }
`;

// Tambah unit baru.
// `input` mengikuti UnitInput: name, parentId, prefix, unitType.
export const CREATE_UNIT = gql`
  mutation CreateUnit($input: UnitInput!) {
    createUnit(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah unit yang ada.
// `input` sama dengan UnitInput; `editUnitId` adalah id unit.
export const EDIT_UNIT = gql`
  mutation EditUnit($input: UnitInput!, $editUnitId: Int!) {
    editUnit(input: $input, id: $editUnitId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus unit. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_UNIT = gql`
  mutation DeleteUnit($deleteUnitId: Int!, $hard: Boolean!) {
    deleteUnit(id: $deleteUnitId, hard: $hard) {
      data
    }
  }
`;
