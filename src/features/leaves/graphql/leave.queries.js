import gql from "graphql-tag";

export const LEAVES = gql`
  query Leaves($search: String, $status: String) {
    leaves(search: $search, status: $status) {
      id
      emp
      type
      from
      to
      days
      reason
      status
      applied
    }
  }
`;

export const LEAVE_STATS = gql`
  query LeaveStats {
    leaveStats {
      total
      pending
      approved
      rejected
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

export const CREATE_LEAVE = gql`
  mutation CreateLeave($input: LeaveInput!) {
    createLeave(input: $input) {
      id
      emp
    }
  }
`;
