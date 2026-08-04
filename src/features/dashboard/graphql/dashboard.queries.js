import gql from "graphql-tag";

// Statistik ringkas 4 kartu atas
export const DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalEmployees
      presentToday
      pendingLeaves
      pendingPayroll
      employeesDelta
      totalHeadcount
    }
  }
`;

// Data bar chart kehadiran mingguan
export const ATTENDANCE_WEEKLY = gql`
  query AttendanceWeekly {
    attendanceWeekly {
      day
      present
      late
      absent
    }
  }
`;

// Distribusi karyawan per departemen (doughnut)
export const DEPT_DISTRIBUTION = gql`
  query DepartmentDistribution {
    departmentDistribution {
      dept
      count
    }
  }
`;

// Aktivitas terbaru
export const RECENT_ACTIVITIES = gql`
  query RecentActivities {
    recentActivities {
      id
      text
      time
      color
    }
  }
`;

// Pengajuan cuti yang menunggu persetujuan
export const PENDING_LEAVES = gql`
  query PendingLeaves {
    pendingLeaves {
      id
      emp
      type
      dateRange
      status
    }
  }
`;

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

export const APPROVE_LEAVE = gql`
  mutation ApproveLeave($id: ID!) {
    approveLeave(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_LEAVE = gql`
  mutation RejectLeave($id: ID!) {
    rejectLeave(id: $id) {
      id
      status
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
    }
  }
`;
