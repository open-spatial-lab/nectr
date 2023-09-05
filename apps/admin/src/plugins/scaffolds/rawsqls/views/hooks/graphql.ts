import gql from 'graphql-tag'

// The same set of fields is being used on all query and mutation operations below.
export const RAWSQL_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment RawsqlFields on Rawsql {
    id
    title
    description
    createdOn
    savedOn
    createdBy {
      id
      displayName
      type
    }
  }
`

export const LIST_RAWSQLS = gql`
  ${RAWSQL_FIELDS_FRAGMENT}
  query ListRawsqls($sort: RawsqlsListSort, $limit: Int, $after: String, $before: String) {
    rawsqls {
      listRawsqls(sort: $sort, limit: $limit, after: $after, before: $before) {
        data {
          ...RawsqlFields
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

export const CREATE_RAWSQL = gql`
  ${RAWSQL_FIELDS_FRAGMENT}
  mutation CreateRawsql($data: RawsqlCreateInput!) {
    rawsqls {
      createRawsql(data: $data) {
        ...RawsqlFields
      }
    }
  }
`

export const GET_RAWSQL = gql`
  ${RAWSQL_FIELDS_FRAGMENT}
  query GetRawsql($id: ID!) {
    rawsqls {
      getRawsql(id: $id) {
        ...RawsqlFields
      }
    }
  }
`

export const DELETE_RAWSQL = gql`
  ${RAWSQL_FIELDS_FRAGMENT}
  mutation DeleteRawsql($id: ID!) {
    rawsqls {
      deleteRawsql(id: $id) {
        ...RawsqlFields
      }
    }
  }
`

export const UPDATE_RAWSQL = gql`
  ${RAWSQL_FIELDS_FRAGMENT}
  mutation UpdateRawsql($id: ID!, $data: RawsqlUpdateInput!) {
    rawsqls {
      updateRawsql(id: $id, data: $data) {
        ...RawsqlFields
      }
    }
  }
`
