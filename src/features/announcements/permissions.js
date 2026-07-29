/**
 * Kunci permission fitur Pengumuman (Announcement) — tiap nilai adalah nama
 * operasi GraphQL yang di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listAnnouncement",
  GET: "getAnnouncement",
  CREATE: "createAnnouncement",
  EDIT: "editAnnouncement",
  DELETE: "deleteAnnouncement",
};
