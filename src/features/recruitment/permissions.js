/**
 * Kunci permission fitur Rekrutmen — tiap nilai adalah nama operasi GraphQL yang
 * di-gate backend (cocok dengan `user.userPermissions`).
 */
export const PERM = {
  APPLICANTS: "applicants",
  JOBS: "jobs",
  STATS: "recruitmentStats",
  CREATE_JOB: "createJob",
  MOVE_STAGE: "moveApplicantStage",
};
