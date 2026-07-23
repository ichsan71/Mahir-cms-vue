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
          company {
            name
          }
          unit {
            name
          }
        }
      }
    }
  }
`;
