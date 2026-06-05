import gql from "graphql-tag";

// Satu query agregat untuk seluruh tab laporan.
export const REPORTS = gql`
  query Reports {
    monthlyAttendance {
      month
      ontime
      late
      absent
    }
    monthlyPayroll {
      month
      total
      basic
      allowance
      deduction
    }
    deptHeadcount {
      dept
      total
      active
      inactive
    }
    employeeStats {
      total
      active
      inactive
      departments
    }
    leaves(status: "") {
      id
      type
      days
      status
    }
  }
`;
