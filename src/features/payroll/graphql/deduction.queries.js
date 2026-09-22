import gql from "graphql-tag";

// Daftar potongan gaji (hasil kalkulasi kehadiran) — paginated.
// `params` (EmployeeSalaryDeductionParams): page, pageSize, search, employeeIds,
// salaryIds, periodEndFrom, periodEndTo, isFinal.
export const LIST_EMPLOYEE_SALARY_DEDUCTION = gql`
  query ListEmployeeSalaryDeduction($params: EmployeeSalaryDeductionParams) {
    listEmployeeSalaryDeduction(params: $params) {
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
          totalWorkDay
          absentDays
          unpaidLeaveDays
          totalDeduction
          currency
          isFinal
          employee {
            id
            fullName
          }
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
      }
    }
  }
`;

// Hitung ulang / buat potongan untuk seorang karyawan pada satu periode bulan.
// `periodMonth` string periode (mis. "2026-09").
export const COMPUTE_EMPLOYEE_SALARY_DEDUCTION = gql`
  mutation ComputeEmployeeSalaryDeduction($employeeId: Int!, $periodMonth: String!) {
    computeEmployeeSalaryDeduction(employeeId: $employeeId, periodMonth: $periodMonth) {
      data {
        id
        periodStart
        periodEnd
        totalDeduction
        isFinal
      }
    }
  }
`;
