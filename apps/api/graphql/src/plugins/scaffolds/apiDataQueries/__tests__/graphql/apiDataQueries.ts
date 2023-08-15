/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_API_DATA_QUERY = /* GraphQL */ `
  query GetApiDataQuery($id: ID!) {
    apiDataQueries {
      getApiDataQuery(id: $id) {
        id
        title
        template
      }
    }
  }
`

export const CREATE_API_DATA_QUERY = /* GraphQL */ `
  mutation CreateApiDataQuery($data: ApiDataQueryCreateInput!) {
    apiDataQueries {
      createApiDataQuery(data: $data) {
        id
        title
        template
      }
    }
  }
`

export const UPDATE_API_DATA_QUERY = /* GraphQL*/ `
    mutation UpdateApiDataQuery($id: ID!, $data: ApiDataQueryUpdateInput!) {
        apiDataQueries {
            updateApiDataQuery(id: $id, data: $data) {
                id
                title
                template
            }
        }
    }
`

export const DELETE_API_DATA_QUERY = /* GraphQL */ `
  mutation DeleteApiDataQuery($id: ID!) {
    apiDataQueries {
      deleteApiDataQuery(id: $id) {
        id
        title
        template
      }
    }
  }
`

export const LIST_API_DATA_QUERIES = /* GraphQL */ `
  query ListApiDataQueries($sort: ApiDataQueriesListSort, $limit: Int, $after: String) {
    apiDataQueries {
      listApiDataQueries(sort: $sort, limit: $limit, after: $after) {
        data {
          id
          title
          template
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
