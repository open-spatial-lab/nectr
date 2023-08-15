import gql from 'graphql-tag'

// The same set of fields is being used on all query and mutation operations below.
export const DATASET_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment DatasetFields on Dataset {
    id
    title
    description
    createdOn
    savedOn
    columns {
      name
      type
      description
    }
    isPublic
    filename
    createdBy {
      id
      displayName
      type
    }
  }
`

export const LIST_DATASETS = gql`
  ${DATASET_FIELDS_FRAGMENT}
  query ListDatasets($sort: DatasetsListSort, $limit: Int, $after: String, $before: String) {
    datasets {
      listDatasets(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...DatasetFields
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

export const CREATE_DATASET = gql`
  ${DATASET_FIELDS_FRAGMENT}
  mutation CreateDataset($data: DatasetCreateInput!) {
    datasets {
      createDataset(data: $data) {
        ...DatasetFields
      }
    }
  }
`

export const GET_DATASET = gql`
  ${DATASET_FIELDS_FRAGMENT}
  query GetDataset($id: ID!) {
    datasets {
      getDataset(id: $id) {
        ...DatasetFields
      }
    }
  }
`

export const DELETE_DATASET = gql`
  ${DATASET_FIELDS_FRAGMENT}
  mutation DeleteDataset($id: ID!) {
    datasets {
      deleteDataset(id: $id) {
        ...DatasetFields
      }
    }
  }
`

export const UPDATE_DATASET = gql`
  ${DATASET_FIELDS_FRAGMENT}
  mutation UpdateDataset($id: ID!, $data: DatasetUpdateInput!) {
    datasets {
      updateDataset(id: $id, data: $data) {
        ...DatasetFields
      }
    }
  }
`
