import gql from "graphql-tag";

export const ATTENDANCE_RECORDS = gql`
  query AttendanceRecords($search: String, $status: String) {
    attendanceRecords(search: $search, status: $status) {
      id
      date
      emp
      dept
      checkIn
      checkOut
      hours
      status
    }
  }
`;

export const ATTENDANCE_STATS = gql`
  query AttendanceStats {
    attendanceStats {
      ontime
      late
      absent
      leave
    }
  }
`;
