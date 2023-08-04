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

    type JoinQuery {
        leftSourceId: String!
        leftOn: String!
        rightSourceId: String!
        rightOn: String!
        operator: String!
    }

    type MetaColumnSchema {
        name: String!
        sourceId: String!
        sourceTitle: String!
        alias: String
        aggregate: String
    }

    type GroupByQuery {
        sourceId: String!
        column: String!
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

    input JoinQueryInput {
        leftSourceId: String!
        leftOn: String!
        rightSourceId: String!
        rightOn: String!
        operator: String!
    }

    input MetaColumnSchemaInput {
        name: String!
        sourceId: String!
        sourceTitle: String!
        alias: String
        aggregate: String
    }

    input GroupByQueryInput {
        sourceId: String!
        column: String!
    }

    type ApiDataQuery {
        id: ID!
        title: String!
        sources: [Source]
        wheres: [WhereQuery]
        joins: [JoinQuery]
        columns: [MetaColumnSchema]
        groupbys: [GroupByQuery]
        createdOn: DateTime!
        savedOn: DateTime!
        isPublic: Boolean
        canView: [String]
        canEdit: [String]
        canDelete: [String]
        defaultParameters: String
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
    }

    type ApiDataQueriesListMeta {
        limit: Number
        before: String
        after: String
    }

    enum ApiDataQueriesListSort {
        createdOn_ASC
        createdOn_DESC
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
`;
