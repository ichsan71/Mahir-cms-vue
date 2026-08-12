import gql from "graphql-tag";

// Daftar cuti (leave) yang sudah DISETUJUI, untuk kartu "Cuti Hari Ini".
// `params` (LeaveParams): page, pageSize, status. Rentang tanggal difilter
// di sisi klien (startDate..endDate mencakup hari ini).
export const LIST_LEAVE_TODAY = gql`
  query ListLeaveToday($params: LeaveParams) {
    listLeave(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          status
          reason
          startDate
          endDate
          leaveType {
            name
          }
          employee {
            id
            image
            fullName
            roleName
          }
        }
      }
    }
  }
`;

// Kehadiran HARI INI untuk seorang karyawan (dipakai kartu status absen).
// Param: dateGte=dateLte=hari ini, employeeId=akun login. `logs.timestamp`
// dipakai untuk menurunkan jam masuk (tap paling awal) & pulang (tap terakhir).
export const TODAY_ATTENDANCE = gql`
  query TodayAttendance($params: AttendanceParams) {
    listAttendance(params: $params) {
      data {
        results {
          id
          status
          lateSeconds
          earlyLeaveSeconds
          scheduledCheckIn
          scheduledCheckOut
          holiday {
            id
            name
          }
          logs {
            timestamp
            attendanceType
          }
        }
      }
    }
  }
`;

// Konteks karyawan untuk validasi absen: koordinat & toleransi jarak cabang
// (dalam meter) plus pola kerja (jadwal shift per hari). `getEmployeeId` = id
// karyawan login. Dipakai untuk mengecek apakah posisi GPS berada dalam radius
// cabang sebelum mengirim log absen.
export const GET_EMPLOYEE_ATTENDANCE_CONTEXT = gql`
  query GetEmployeeAttendanceContext($getEmployeeId: Int!) {
    getEmployee(id: $getEmployeeId) {
      data {
        branch {
          address {
            latitude
            longitude
            distanceTolerance
          }
        }
        workPattern {
          details {
            shift {
              startTime
              endTime
            }
            isWorkday
            weekday
            weekdayDisplay
          }
        }
      }
    }
  }
`;

// Catat satu log absen (tap masuk/keluar). `input` (AttendanceLogInput):
// attendanceType ("IN"/"OUT"), source ("GPS"), employeeId, latitude, longitude,
// deviceId, deviceName, image (nullable), isManual (null), note (opsional).
export const CREATE_ATTENDANCE_LOG = gql`
  mutation CreateAttendanceLog($input: AttendanceLogInput!) {
    createAttendanceLog(input: $input) {
      data {
        id
      }
    }
  }
`;

// Daftar kehadiran (attendance) paginated sesuai kontrak backend.
// Tiap baris = satu hari kehadiran untuk seorang karyawan: jadwal shift,
// jam terjadwal, durasi kerja/keterlambatan, status, plus `logs` (kejadian
// tap masuk/keluar mentah dari perangkat/manual).
// `params` (AttendanceParams): page, pageSize, search, dateGte, dateLte, employeeId.
export const LIST_ATTENDANCE = gql`
  query ListAttendance($params: AttendanceParams) {
    listAttendance(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          employee {
            id
            fullName
          }
          date
          shift
          holiday {
            id
            name
          }
          status
          scheduledCheckIn
          scheduledCheckOut
          workedSeconds
          lateSeconds
          earlyLeaveSeconds
          logs {
            id
            source
            attendanceType
            latitude
            longitude
            timestamp
            deviceId
            deviceName
            image
            isManual
            note
          }
        }
      }
    }
  }
`;
