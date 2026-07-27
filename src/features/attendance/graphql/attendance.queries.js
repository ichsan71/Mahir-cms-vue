import gql from "graphql-tag";

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
