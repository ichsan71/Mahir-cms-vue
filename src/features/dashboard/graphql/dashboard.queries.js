import gql from "graphql-tag";

// Struktur organisasi: karyawan puncak (root) beserta pohon bawahannya.
// `childrenTree` adalah scalar JSON berisi node bersarang (full_name/code/childrens).
export const GET_ROOT_EMPLOYEE = gql`
  query GetRootEmployee {
    getRootEmployee {
      data {
        childrenTree
        id
        fullName
        units {
          id
          name
        }
      }
    }
  }
`;

// Subscription realtime ringkasan kehadiran untuk dashboard.
// `histories`: satu baris per (tanggal, status) berisi jumlah & daftar karyawan.
// Status: PRESENT, LATE, EARLY_LEAVE, ON_LEAVE, PENDING, WEEKEND, dst.
export const ATTENDANCE_DASHBOARD_SUB = gql`
  subscription AttendanceDashboard {
    attendanceDashboard {
      histories {
        id
        snapshotDate
        status
        employeeCount
        employees {
          id
          fullName
        }
      }
      totalEmployee
    }
  }
`;
