import gql from "graphql-tag";

// Daftar slip gaji (paginated). `params` (PayslipParams): page, pageSize, search,
// includeDeleted, onlyDeleted, employeeIds, periodEndFrom, periodEndTo.
export const LIST_PAYSLIP = gql`
  query ListPayslip($params: PayslipParams) {
    listPayslip(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          periodStart
          periodEnd
          gross
          totalDeduction
          bpjsEmployer
          bpjsEmployee
          pph21
          netPay
          adjustment
          adjustmentNote
          currency
          status
          finalizedAt
          emittedAt
          employee {
            id
            fullName
            units {
              id
              name
            }
            level {
              id
              name
            }
          }
        }
      }
    }
  }
`;

// Detail satu slip gaji + rincian (breakdown) + jejak persetujuan.
export const GET_PAYSLIP = gql`
  query GetPayslip($id: Int!) {
    getPayslip(id: $id) {
      data {
        id
        periodStart
        periodEnd
        gross
        totalDeduction
        bpjsEmployer
        bpjsEmployee
        pph21
        netPay
        adjustment
        adjustmentNote
        breakdown
        currency
        status
        finalizedAt
        emittedAt
        employee {
          id
          fullName
          units {
            id
            name
          }
          level {
            id
            name
          }
        }
        deduction {
          id
          totalWorkDay
          absentDays
          unpaidLeaveDays
          totalDeduction
          currency
          isFinal
          breakdown {
            componentTypeId
            code
            category
            monthlyValue
            dailyRate
            unpaidDays
            lateForfeitDays
            daysDeducted
            amount
          }
        }
        approvals {
          results {
            id
            order
            status
            remark
            actedAt
            approver {
              id
              fullName
            }
          }
        }
      }
    }
  }
`;

// Inbox persetujuan slip gaji (baris PayslipApproval). `params`
// (PayslipApprovalParams): page, pageSize, search, status, payslipIds,
// approverIds, employeeIds.
export const LIST_PAYSLIP_APPROVAL = gql`
  query ListPayslipApproval($params: PayslipApprovalParams) {
    listPayslipApproval(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          order
          status
          remark
          actedAt
          approver {
            id
            fullName
          }
          payslip {
            id
            periodStart
            periodEnd
            gross
            totalDeduction
            netPay
            currency
            status
            employee {
              id
              fullName
              units {
                id
                name
              }
              level {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

// ── Mutations ────────────────────────────────────────────────────────────────

// Generate slip gaji seorang karyawan untuk satu periode bulan ("YYYY-MM").
// `email` opsional: kirim salinan slip ke alamat tsb.
export const GENERATE_PAYSLIP = gql`
  mutation GeneratePayslip($employeeId: Int!, $periodMonth: String!, $email: String) {
    generatePayslip(employeeId: $employeeId, periodMonth: $periodMonth, email: $email) {
      data {
        id
        status
      }
    }
  }
`;

// Finalisasi slip gaji (kunci nilai dari perubahan lanjutan).
export const FINALIZE_PAYSLIP = gql`
  mutation FinalizePayslip($id: Int!) {
    finalizePayslip(id: $id) {
      data {
        id
        status
        finalizedAt
      }
    }
  }
`;

// Penyesuaian nominal slip (adjustment ± dengan catatan).
export const ADJUST_PAYSLIP = gql`
  mutation AdjustPayslip($id: Int!, $adjustment: Decimal!, $adjustmentNote: String) {
    adjustPayslip(id: $id, adjustment: $adjustment, adjustmentNote: $adjustmentNote) {
      data {
        id
        adjustment
        adjustmentNote
        netPay
        status
      }
    }
  }
`;

// Ajukan slip untuk persetujuan — berdasarkan daftar id ATAU filter.
export const SUBMIT_PAYSLIP = gql`
  mutation SubmitPayslip($ids: [Int!], $filters: PayslipParams) {
    submitPayslip(ids: $ids, filters: $filters) {
      data {
        id
        status
      }
    }
  }
`;

// Pulihkan slip yang terhapus (soft delete).
export const RESTORE_PAYSLIP = gql`
  mutation RestorePayslip($id: Int!) {
    restorePayslip(id: $id) {
      data {
        id
        status
      }
    }
  }
`;

// Ekspor slip gaji (async) ke email. `input` (PayslipExportInput):
// email, filters (PayslipParams), format (CSV | XLSX).
export const EXPORT_PAYSLIP = gql`
  mutation ExportPayslip($input: PayslipExportInput!) {
    exportPayslip(input: $input) {
      data {
        payslipCount
        estimatedSeconds
      }
    }
  }
`;

// Persetujuan satu baris (id = id PayslipApproval, bukan id Payslip).
export const APPROVE_PAYSLIP = gql`
  mutation ApprovePayslip($id: Int!, $remark: String) {
    approvePayslip(id: $id, remark: $remark) {
      data {
        id
        status
        remark
        actedAt
      }
    }
  }
`;

export const REJECT_PAYSLIP = gql`
  mutation RejectPayslip($id: Int!, $remark: String) {
    rejectPayslip(id: $id, remark: $remark) {
      data {
        id
        status
        remark
        actedAt
      }
    }
  }
`;

// Persetujuan massal (ids = daftar id PayslipApproval).
export const APPROVE_PAYSLIP_MANY = gql`
  mutation ApprovePayslipMany($ids: [Int!]!, $remark: String) {
    approvePayslipMany(ids: $ids, remark: $remark) {
      data {
        id
        status
      }
    }
  }
`;

export const REJECT_PAYSLIP_MANY = gql`
  mutation RejectPayslipMany($ids: [Int!]!, $remark: String) {
    rejectPayslipMany(ids: $ids, remark: $remark) {
      data {
        id
        status
      }
    }
  }
`;
