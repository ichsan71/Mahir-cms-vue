import gql from "graphql-tag";

// Daftar pola kerja (paginated) sesuai kontrak backend.
// `params` (WorkPatternParams) opsional: page, pageSize, search, companyName.
// Tiap pola punya `details` per hari: apakah hari kerja + shift yang dipakai.
export const LIST_WORK_PATTERN = gql`
  query ListWorkPattern($params: WorkPatternParams) {
    listWorkPattern(params: $params) {
      data {
        count
        currentPage
        hasNext
        hasPrev
        totalPages
        results {
          id
          name
          details {
            id
            isWorkday
            shift {
              id
              startTime
              endTime
            }
            weekday
            weekdayDisplay
          }
        }
      }
    }
  }
`;

// Detail satu pola kerja untuk halaman profil & prefill edit.
// `company { id }` & `description` ditambahkan agar edit bisa memuat ulang nilainya.
export const GET_WORK_PATTERN = gql`
  query GetWorkPattern($getWorkPatternId: Int!) {
    getWorkPattern(id: $getWorkPatternId) {
      data {
        id
        name
        description
        company {
          id
          name
        }
        details {
          id
          weekday
          weekdayDisplay
          isWorkday
          shift {
            id
            name
            startTime
            endTime
          }
        }
      }
    }
  }
`;

// Tambah pola kerja baru.
// `input` mengikuti WorkPatternInput: name, description, companyId.
export const CREATE_WORK_PATTERN = gql`
  mutation CreateWorkPattern($input: WorkPatternInput!) {
    createWorkPattern(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

// Ubah pola kerja yang ada. `editWorkPatternId` adalah id pola kerja.
export const EDIT_WORK_PATTERN = gql`
  mutation EditWorkPattern($input: WorkPatternInput!, $editWorkPatternId: Int!) {
    editWorkPattern(input: $input, id: $editWorkPatternId) {
      data {
        id
        name
      }
    }
  }
`;

// Hapus pola kerja. `hard` selalu false (soft delete) sesuai kebijakan —
// mengikuti pola mutasi delete fitur lain.
export const DELETE_WORK_PATTERN = gql`
  mutation DeleteWorkPattern($deleteWorkPatternId: Int!, $hard: Boolean!) {
    deleteWorkPattern(id: $deleteWorkPatternId, hard: $hard) {
      data
    }
  }
`;

// Tambah baris jadwal harian (satu weekday) pada sebuah pola kerja.
// `input` (WorkPatternDetailInput): patternId, weekday, isWorkday, shiftId.
export const CREATE_WORK_PATTERN_DETAIL = gql`
  mutation CreateWorkPatternDetail($input: WorkPatternDetailInput!) {
    createWorkPatternDetail(input: $input) {
      data {
        id
      }
    }
  }
`;

// Ubah satu baris jadwal harian yang sudah ada (`editWorkPatternDetailId` = id detail).
export const EDIT_WORK_PATTERN_DETAIL = gql`
  mutation EditWorkPatternDetail($input: WorkPatternDetailInput!, $editWorkPatternDetailId: Int!) {
    editWorkPatternDetail(input: $input, id: $editWorkPatternDetailId) {
      data {
        id
      }
    }
  }
`;
