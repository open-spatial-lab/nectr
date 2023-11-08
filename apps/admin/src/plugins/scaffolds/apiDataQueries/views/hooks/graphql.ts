import gql from 'graphql-tag'

// The same set of fields is being used on all query and mutation operations below.
export const API_DATA_QUERY_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment ApiDataQueryFields on ApiDataQuery {
    id
    title
    createdOn
    savedOn
    canView
    canEdit
    canDelete
    isPublic
    defaultParameters
    sources {
      id
      type
      title
    }
    wheres {
      sourceId
      column
      operator
      value
      allowCustom
      customAlias
    }
    distinct
    joins {
      leftSourceId
      leftOn
      rightSourceId
      rightOn
      operator
      geoPredicate
      leftOnGeo {
        operation
        args
      }
      rightOnGeo {
        operation
        args
      }
    }
    columns {
      name
      sourceId
      sourceTitle
      alias
      aggregate
      expression
    }
    groupbys {
      sourceId
      column
    }
    orderbys {
      sourceId
      column
      direction
    }
    limit
    offset
    combinedOperator
    dataViewTemplate
    createdBy {
      id
      displayName
      type
    }
    ttl
  }
`

export const LIST_API_DATA_QUERIES = gql`
  ${API_DATA_QUERY_FIELDS_FRAGMENT}
  query ListApiDataQueries(
    $sort: ApiDataQueriesListSort
    $limit: Int
    $after: String
    $before: String
  ) {
    apiDataQueries {
      listApiDataQueries(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...ApiDataQueryFields
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

export const CREATE_API_DATA_QUERY = gql`
  ${API_DATA_QUERY_FIELDS_FRAGMENT}
  mutation CreateApiDataQuery($data: ApiDataQueryCreateInput!) {
    apiDataQueries {
      createApiDataQuery(data: $data) {
        ...ApiDataQueryFields
      }
    }
  }
`

export const GET_API_DATA_QUERY = gql`
  ${API_DATA_QUERY_FIELDS_FRAGMENT}
  query GetApiDataQuery($id: ID!) {
    apiDataQueries {
      getApiDataQuery(id: $id) {
        ...ApiDataQueryFields
      }
    }
  }
`

export const DELETE_API_DATA_QUERY = gql`
  ${API_DATA_QUERY_FIELDS_FRAGMENT}
  mutation DeleteApiDataQuery($id: ID!) {
    apiDataQueries {
      deleteApiDataQuery(id: $id) {
        ...ApiDataQueryFields
      }
    }
  }
`

export const UPDATE_API_DATA_QUERY = gql`
  ${API_DATA_QUERY_FIELDS_FRAGMENT}
  mutation UpdateApiDataQuery($id: ID!, $data: ApiDataQueryUpdateInput!) {
    apiDataQueries {
      updateApiDataQuery(id: $id, data: $data) {
        ...ApiDataQueryFields
      }
    }
  }
`
