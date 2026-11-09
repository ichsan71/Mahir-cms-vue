import gql from "graphql-tag";

// Slip gaji milik diri sendiri, dibaca dari field nested
// `getEmployee.payslips(params)`. Query ini SENGAJA dipisah dari GET_MY_PROFILE
// dan hanya dijalankan setelah user lolos gerbang password (re-auth) — supaya
// data gaji yang sensitif tidak ikut ter-fetch sebelum dibuka.
//
// Catatan: PayslipParams tidak punya filter status, jadi penyaringan hanya slip
// FINAL dilakukan di sisi klien.
export const GET_MY_PAYSLIPS = gql`
  query GetMyPayslips($getEmployeeId: Int!, $params: PayslipParams) {
    getEmployee(id: $getEmployeeId) {
      data {
        id
        payslips(params: $params) {
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
            breakdown
            currency
            status
            finalizedAt
            emittedAt
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
          }
        }
      }
    }
  }
`;
