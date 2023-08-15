import gql from 'graphql-tag'

// The same set of fields is being used on all query and mutation operations below.
export const DATA_UPLOAD_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment DataUploadFields on DataUpload {
    id
    title
    description
    createdOn
    savedOn
    isPublic
    canView
    canEdit
    canDelete
    createdBy {
      id
      displayName
      type
    }
  }
`

export const LIST_DATA_UPLOADS = gql`
  ${DATA_UPLOAD_FIELDS_FRAGMENT}
  query ListDataUploads($sort: DataUploadsListSort, $limit: Int, $after: String, $before: String) {
    dataUploads {
      listDataUploads(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...DataUploadFields
        }
        meta {
          before
          after
          limit
        }
      }
    }
  }
`

export const CREATE_DATA_UPLOAD = gql`
  ${DATA_UPLOAD_FIELDS_FRAGMENT}
  mutation CreateDataUpload($data: DataUploadCreateInput!) {
    dataUploads {
      createDataUpload(data: $data) {
        ...DataUploadFields
      }
    }
  }
`

export const LIST_USERS = gql`
  query ListUsers {
    adminUsers {
      listUsers {
        data {
          email
        }
      }
    }
  }
`

export const GET_DATA_UPLOAD = gql`
  ${DATA_UPLOAD_FIELDS_FRAGMENT}
  query GetDataUpload($id: ID!) {
    dataUploads {
      getDataUpload(id: $id) {
        ...DataUploadFields
      }
    }
  }
`

export const DELETE_DATA_UPLOAD = gql`
  ${DATA_UPLOAD_FIELDS_FRAGMENT}
  mutation DeleteDataUpload($id: ID!) {
    dataUploads {
      deleteDataUpload(id: $id) {
        ...DataUploadFields
      }
    }
  }
`

export const UPDATE_DATA_UPLOAD = gql`
  ${DATA_UPLOAD_FIELDS_FRAGMENT}
  mutation UpdateDataUpload($id: ID!, $data: DataUploadUpdateInput!) {
    dataUploads {
      updateDataUpload(id: $id, data: $data) {
        ...DataUploadFields
      }
    }
  }
`
