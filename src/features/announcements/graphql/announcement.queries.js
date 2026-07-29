import gql from "graphql-tag";

// Buat pengumuman baru.
// `input` (AnnouncementInput): title, content, status (AnnouncementStatusChoices),
// isPinned, publishedAt, expiredAt, companyIds[Int], unitIds[Int],
// attachments[{ file: Upload }].
export const CREATE_ANNOUNCEMENT = gql`
  mutation CreateAnnouncement($input: AnnouncementInput!) {
    createAnnouncement(input: $input) {
      data {
        id
        title
      }
    }
  }
`;

// Ubah pengumuman. `input` = AnnouncementInput (attachments baru boleh membawa
// `announcementId`); `editAnnouncementId` = id pengumuman.
export const EDIT_ANNOUNCEMENT = gql`
  mutation EditAnnouncement($input: AnnouncementInput!, $editAnnouncementId: Int!) {
    editAnnouncement(input: $input, id: $editAnnouncementId) {
      data {
        id
        title
      }
    }
  }
`;

// Daftar pengumuman (paginated). `params` (AnnouncementParams): page, pageSize,
// title, status (AnnouncementStatusChoices), companyIds[Int], unitIds[Int].
// (id/status/isPinned/publishedAt ditambahkan agar list bisa dibuka/dihapus.)
export const LIST_ANNOUNCEMENT = gql`
  query ListAnnouncement($params: AnnouncementParams) {
    listAnnouncement(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          title
          status
          isPinned
          publishedAt
          attachments {
            file
          }
          companies {
            id
            name
          }
          units {
            id
            name
          }
        }
      }
    }
  }
`;

// Detail satu pengumuman untuk modal/halaman detail.
export const GET_ANNOUNCEMENT = gql`
  query GetAnnouncement($getAnnouncementId: Int!) {
    getAnnouncement(id: $getAnnouncementId) {
      data {
        id
        title
        content
        status
        isPinned
        publishedAt
        expiredAt
        companies {
          id
          name
        }
        units {
          id
          name
        }
        attachments {
          file
        }
      }
    }
  }
`;

// Hapus pengumuman. `hard` selalu false (soft delete) sesuai kebijakan.
export const DELETE_ANNOUNCEMENT = gql`
  mutation DeleteAnnouncement($deleteAnnouncementId: Int!, $hard: Boolean!) {
    deleteAnnouncement(id: $deleteAnnouncementId, hard: $hard) {
      data
    }
  }
`;
