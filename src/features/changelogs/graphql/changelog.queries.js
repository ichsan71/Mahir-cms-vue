import gql from "graphql-tag";

// Daftar changelog (paginated). `params` (ChangeLogParams): page, pageSize,
// search, appName, platform, changeType, version, createdBy.
// Filter appName/platform/changeType mengirim nilai dari `infraChoices`.
export const LIST_CHANGELOG = gql`
  query ListChangeLog($params: ChangeLogParams) {
    listChangeLog(params: $params) {
      data {
        count
        totalPages
        currentPage
        hasNext
        hasPrev
        results {
          id
          title
          description
          changeType
          platform
          appName
          version
          minVersion
          authorName
          createdAt
          attachments {
            file
          }
        }
      }
    }
  }
`;

// Detail satu changelog untuk modal detail.
export const GET_CHANGELOG = gql`
  query GetChangeLog($id: Int!) {
    getChangeLog(id: $id) {
      data {
        id
        title
        description
        changeType
        platform
        appName
        version
        minVersion
        reference
        authorName
        metadata
        createdAt
        attachments {
          id
          file
          kind
          caption
          uploadedAt
        }
      }
    }
  }
`;
