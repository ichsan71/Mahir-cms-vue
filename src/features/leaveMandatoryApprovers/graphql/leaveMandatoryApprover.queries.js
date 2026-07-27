import gql from "graphql-tag";

// Daftar approver wajib cuti (leave mandatory approver) paginated.
// Mendefinisikan urutan (`order`) persetujuan wajib per perusahaan/unit.
// `params` (LeaveMandatoryApproverParams): page, pageSize, search,
// companyIds, companyName, unitIds, unitName, notId.
export const LIST_LEAVE_MANDATORY_APPROVER = gql`
  query ListLeaveMandatoryApprover($params: LeaveMandatoryApproverParams) {
    listLeaveMandatoryApprover(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          order
          unit {
            id
            name
          }
          company {
            id
            name
          }
        }
      }
    }
  }
`;

// Tambah approver wajib. `input` (LeaveMandatoryApproverInput):
// companyId, unitId, order, isActive.
export const CREATE_LEAVE_MANDATORY_APPROVER = gql`
  mutation CreateLeaveMandatoryApprover($input: LeaveMandatoryApproverInput!) {
    createLeaveMandatoryApprover(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah approver wajib. `id` = id baris LeaveMandatoryApprover.
export const EDIT_LEAVE_MANDATORY_APPROVER = gql`
  mutation EditLeaveMandatoryApprover($input: LeaveMandatoryApproverInput!, $editLeaveMandatoryApproverId: Int!) {
    editLeaveMandatoryApprover(input: $input, id: $editLeaveMandatoryApproverId) {
      data {
        id
      }
    }
  }
`;

// Hapus approver wajib. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_LEAVE_MANDATORY_APPROVER = gql`
  mutation DeleteLeaveMandatoryApprover($deleteLeaveMandatoryApproverId: Int!, $hard: Boolean!) {
    deleteLeaveMandatoryApprover(id: $deleteLeaveMandatoryApproverId, hard: $hard) {
      data
    }
  }
`;
