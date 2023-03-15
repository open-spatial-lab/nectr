export default /* GraphQL */ `
    type ApiDataQuery {
        id: ID!
        title: String!
        template: String
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
    }

    input ApiDataQueryUpdateInput {
        title: String
        template: String
        isPublic: Boolean
        canView: [String]
        canEdit: [String]
        canDelete: [String]
        defaultParameters: String
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
