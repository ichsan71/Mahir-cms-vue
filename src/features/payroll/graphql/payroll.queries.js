import gql from "graphql-tag";

export const PAYROLLS = gql`
  query Payrolls($search: String, $status: String) {
    payrolls(search: $search, status: $status) {
      id
      emp
      dept
      period
      basic
      allowance
      deduction
      net
      status
      date
    }
  }
`;

export const PAYROLL_STATS = gql`
  query PayrollStats {
    payrollStats {
      totalNet
      paidNet
      countPaid
      countPending
    }
  }
`;

export const PROCESS_PAYROLL = gql`
  mutation ProcessPayroll($id: ID!) {
    processPayroll(id: $id) {
      id
      status
    }
  }
`;

export const PROCESS_ALL_PAYROLL = gql`
  mutation ProcessAllPayroll {
    processAllPayroll {
      id
      status
    }
  }
`;
