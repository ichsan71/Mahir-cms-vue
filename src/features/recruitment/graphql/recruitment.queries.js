import gql from "graphql-tag";

export const JOBS = gql`
  query Jobs($search: String, $status: String) {
    jobs(search: $search, status: $status) {
      id
      title
      dept
      quota
      applied
      deadline
      status
    }
  }
`;

export const APPLICANTS = gql`
  query Applicants($search: String, $stage: String, $job: String) {
    applicants(search: $search, stage: $stage, job: $job) {
      id
      name
      job
      email
      stage
      applied
      status
    }
  }
`;

export const RECRUITMENT_STATS = gql`
  query RecruitmentStats {
    recruitmentStats {
      openJobs
      totalApplicants
      inProcess
      hired
    }
    stageCounts {
      stage
      count
    }
  }
`;

export const CREATE_JOB = gql`
  mutation CreateJob($input: JobInput!) {
    createJob(input: $input) {
      id
      title
    }
  }
`;

export const MOVE_APPLICANT_STAGE = gql`
  mutation MoveApplicantStage($id: ID!, $stage: String!) {
    moveApplicantStage(id: $id, stage: $stage) {
      id
      stage
      status
    }
  }
`;
