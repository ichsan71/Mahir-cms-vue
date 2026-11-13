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
          approvals {
            results {
              id
              order
              status
              approver {
                id
                fullName
              }
            }
          }
        }
      }
    }
  }
`;

// Detail satu slip gaji + line-item (items) + rincian potongan + jejak persetujuan.
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
        prorationFactor
        currency
        status
        finalizedAt
        emittedAt
        items {
          id
          kind
          code
          note
          amount
          componentTypeId
          category
          base
          dailyRate
          paidDays
          prorated
          order
        }
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
          companies {
            id
            name
            legalName
            npwp
            logo
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

// ── Item slip (PayslipItem) ──────────────────────────────────────────────────
// Penyesuaian kini berupa line-item. `kind` (EmployeePayslipItemKindChoices:
// EARNING/DEDUCTION/BPJS_EMPLOYEE/BPJS_EMPLOYER/TAX/ADJUSTMENT) menentukan jenis.
// Semua item bisa diedit (nominal/keterangan via editPayslipItem); hanya
// kind=ADJUSTMENT yang bisa ditambah/hapus (manual).

const PAYSLIP_ITEM_FIELDS = gql`
  fragment PayslipItemFields on PayslipItem {
    id
    kind
    code
    note
    amount
    componentTypeId
    category
    base
    dailyRate
    paidDays
    prorated
    order
  }
`;

// Daftar item satu slip (filter by payslip). pageSize besar — item per slip sedikit.
export const LIST_PAYSLIP_ITEM = gql`
  query ListPayslipItem($params: PayslipItemParams) {
    listPayslipItem(params: $params) {
      data {
        count
        results {
          ...PayslipItemFields
        }
      }
    }
  }
  ${PAYSLIP_ITEM_FIELDS}
`;

// Tambah item. `code` = nilai `kind` (lihat composable).
export const CREATE_PAYSLIP_ITEM = gql`
  mutation CreatePayslipItem($input: PayslipItemInput!) {
    createPayslipItem(input: $input) {
      data {
        ...PayslipItemFields
      }
    }
  }
  ${PAYSLIP_ITEM_FIELDS}
`;

export const EDIT_PAYSLIP_ITEM = gql`
  mutation EditPayslipItem($id: Int!, $input: PayslipItemInput!) {
    editPayslipItem(id: $id, input: $input) {
      data {
        ...PayslipItemFields
      }
    }
  }
  ${PAYSLIP_ITEM_FIELDS}
`;

export const DELETE_PAYSLIP_ITEM = gql`
  mutation DeletePayslipItem($id: Int!) {
    deletePayslipItem(id: $id) {
      data
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

// Persetujuan massal (ids = daftar id PayslipApproval). Hasilnya
// PayslipApprovalBulkApprovalResult: results (sukses), failed (gagal + alasan),
// queued (diproses async), count.
export const APPROVE_PAYSLIP_MANY = gql`
  mutation ApprovePayslipMany($ids: [Int!]!, $remark: String) {
    approvePayslipMany(ids: $ids, remark: $remark) {
      data {
        count
        queued
        results {
          id
          status
        }
        failed {
          id
          error
        }
      }
    }
  }
`;

export const REJECT_PAYSLIP_MANY = gql`
  mutation RejectPayslipMany($ids: [Int!]!, $remark: String) {
    rejectPayslipMany(ids: $ids, remark: $remark) {
      data {
        count
        queued
        results {
          id
          status
        }
        failed {
          id
          error
        }
      }
    }
  }
`;
