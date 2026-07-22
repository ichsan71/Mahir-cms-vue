/**
 * Kunci permission fitur Cabang — tiap nilai adalah nama operasi GraphQL yang
 * di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  LIST: "listBranch",
  GET: "getBranch",
  CREATE: "createBranch",
  EDIT: "editBranch",
  DELETE: "deleteBranch",
  // Alamat cabang
  ADDRESS_LIST: "listBranchAddress",
  ADDRESS_CREATE: "createBranchAddress",
  ADDRESS_EDIT: "editBranchAddress",
  ADDRESS_DELETE: "deleteBranchAddress",
};
