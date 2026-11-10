import gql from "graphql-tag";

// Daftar approver wajib penggajian (payroll mandatory approver) paginated.
// Mendefinisikan urutan (`order`) persetujuan wajib slip gaji per perusahaan/unit.
// `params` (PayrollMandatoryApproverParams): page, pageSize, search,
// companyIds, companyName, unitIds, unitName, employeeIds, notId.
export const LIST_PAYROLL_MANDATORY_APPROVER = gql`
  query ListPayrollMandatoryApprover($params: PayrollMandatoryApproverParams) {
    listPayrollMandatoryApprover(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          order
          isActive
          unit {
            id
            name
          }
          company {
            id
            name
          }
          employee {
            id
            fullName
          }
        }
      }
    }
  }
`;

// Tambah approver wajib penggajian. `input` (PayrollMandatoryApproverInput):
// companyId, unitId, employeeId, order, isActive.
export const CREATE_PAYROLL_MANDATORY_APPROVER = gql`
  mutation CreatePayrollMandatoryApprover($input: PayrollMandatoryApproverInput!) {
    createPayrollMandatoryApprover(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah approver wajib. `id` = id baris PayrollMandatoryApprover.
export const EDIT_PAYROLL_MANDATORY_APPROVER = gql`
  mutation EditPayrollMandatoryApprover($input: PayrollMandatoryApproverInput!, $editPayrollMandatoryApproverId: Int!) {
    editPayrollMandatoryApprover(input: $input, id: $editPayrollMandatoryApproverId) {
      data {
        id
      }
    }
  }
`;

// Hapus approver wajib. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_PAYROLL_MANDATORY_APPROVER = gql`
  mutation DeletePayrollMandatoryApprover($deletePayrollMandatoryApproverId: Int!, $hard: Boolean!) {
    deletePayrollMandatoryApprover(id: $deletePayrollMandatoryApproverId, hard: $hard) {
      data
    }
  }
`;
