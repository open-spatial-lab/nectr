export default /* GraphQL */ `
  type Source {
    id: String!
    type: String!
    title: String!
  }

  type WhereQuery {
    sourceId: String!
    column: String!
    operator: String!
    value: String!
    allowCustom: Boolean
    customAlias: String
  }

  type MetaColumnSchema {
    name: String!
    sourceId: String!
    sourceTitle: String
    alias: String
    aggregate: String
    expression: String
    description: String
    type: String
  }

  type ColumnOperation {
    operation: String
    args: [String]
  }

  type JoinQuery {
    leftSourceId: String!
    leftOn: [String]
    rightSourceId: String!
    rightOn: [String]
    operator: String!
    geoPredicate: String
    leftOnGeo: [ColumnOperation]
    rightOnGeo: [ColumnOperation]
  }


  type GroupByQuery {
    sourceId: String!
    column: [String]
  }

  type OrderByQuery {
    sourceId: String!
    column: String!
    direction: String!
  }
  
  input SourceInput {
    id: String!
    type: String!
    title: String!
  }

  input WhereQueryInput {
    sourceId: String!
    column: String!
    operator: String!
    value: String!
    allowCustom: Boolean
    customAlias: String
  }

  input ColumnOperationInput {
    operation: String
    args: [String]
  }

  input JoinQueryInput {
    leftSourceId: String!
    leftOn: [String]
    rightSourceId: String!
    rightOn: [String]
    operator: String!
    geoPredicate: String
    leftOnGeo: [ColumnOperationInput]
    rightOnGeo: [ColumnOperationInput]
  }

  input MetaColumnSchemaInput {
    name: String!
    sourceId: String!
    sourceTitle: String
    alias: String
    aggregate: String
    expression: String
    description: String
    type: String
  }
  

  input GroupByQueryInput {
    sourceId: String!
    column: [String]
  }

  input OrderByQueryInput {
    sourceId: String!
    column: String!
    direction: String!
  }

  type ApiDataQuery {
    id: ID!
    title: String!
    sources: [Source]
    wheres: [WhereQuery]
    joins: [JoinQuery]
    columns: [MetaColumnSchema]
    groupbys: [GroupByQuery]
    orderbys: [OrderByQuery]
    distinct: Boolean
    createdOn: DateTime!
    savedOn: DateTime!
    isPublic: Boolean
    canView: [String]
    canEdit: [String]
    canDelete: [String]
    defaultParameters: String
    limit: Int
    offset: Int
    combinedOperator: String
    dataViewTemplate: String
    createdBy: ApiDataQueryCreatedBy
  }

  type ApiDataQueryCreatedBy {
    id: String!
    type: String!
    displayName: String!
  }

  input ApiDataQueryCreateInput {
    title: String!
    template: String
    isPublic: Boolean
    canView: [String]
    canEdit: [String]
    canDelete: [String]
    defaultParameters: String
    sources: [SourceInput]
    wheres: [WhereQueryInput]
    joins: [JoinQueryInput]
    columns: [MetaColumnSchemaInput]
    groupbys: [GroupByQueryInput]
    orderbys: [OrderByQueryInput]
    distinct: Boolean
    limit: Int
    offset: Int
    combinedOperator: String
    dataViewTemplate: String
  }

  input ApiDataQueryUpdateInput {
    title: String
    template: String
    isPublic: Boolean
    canView: [String]
    canEdit: [String]
    canDelete: [String]
    defaultParameters: String
    sources: [SourceInput]
    wheres: [WhereQueryInput]
    joins: [JoinQueryInput]
    columns: [MetaColumnSchemaInput]
    groupbys: [GroupByQueryInput]
    orderbys: [OrderByQueryInput]
    distinct: Boolean
    limit: Int
    offset: Int
    combinedOperator: String
    dataViewTemplate: String
  }

  type ApiDataQueriesListMeta {
    limit: Number
    before: String
    after: String
  }

  enum ApiDataQueriesListSort {
    createdOn_ASC
    createdOn_DESC
    title_ASC
    title_DESC
  }

  type ApiDataQueriesList {
    data: [ApiDataQuery]
    meta: ApiDataQueriesListMeta
  }

  type ApiDataQueryQuery {
    # Returns a single ApiDataQuery entry.
    getApiDataQuery(id: ID!): ApiDataQuery

    # Lists one or more ApiDataQuery entries.
    listApiDataQueries(
      limit: Int
      before: String
      after: String
      sort: ApiDataQueriesListSort
    ): ApiDataQueriesList!
  }

  type ApiDataQueryMutation {
    # Creates and returns a new ApiDataQuery entry.
    createApiDataQuery(data: ApiDataQueryCreateInput!): ApiDataQuery!

    # Updates and returns an existing ApiDataQuery entry.
    updateApiDataQuery(id: ID!, data: ApiDataQueryUpdateInput!): ApiDataQuery!

    # Deletes and returns an existing ApiDataQuery entry.
    deleteApiDataQuery(id: ID!): ApiDataQuery!
  }

  extend type Query {
    apiDataQueries: ApiDataQueryQuery
  }

  extend type Mutation {
    apiDataQueries: ApiDataQueryMutation
  }
`
