/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_DATASET = /* GraphQL */ `
  query GetDataset($id: ID!) {
    datasets {
      getDataset(id: $id) {
        id
        title
        description
      }
    }
  }
`

export const CREATE_DATASET = /* GraphQL */ `
  mutation CreateDataset($data: DatasetCreateInput!) {
    datasets {
      createDataset(data: $data) {
        id
        title
        description
      }
    }
  }
`

export const UPDATE_DATASET = /* GraphQL*/ `
    mutation UpdateDataset($id: ID!, $data: DatasetUpdateInput!) {
        datasets {
            updateDataset(id: $id, data: $data) {
                id
                title
                description
            }
        }
    }
`

export const DELETE_DATASET = /* GraphQL */ `
  mutation DeleteDataset($id: ID!) {
    datasets {
      deleteDataset(id: $id) {
        id
        title
        description
      }
    }
  }
`

export const LIST_DATASETS = /* GraphQL */ `
  query ListDatasets($sort: DatasetsListSort, $limit: Int, $after: String) {
    datasets {
      listDatasets(sort: $sort, limit: $limit, after: $after) {
        data {
          id
          title
          description
        }
        meta {
          limit
          after
          before
        }
      }
    }
  }
`
