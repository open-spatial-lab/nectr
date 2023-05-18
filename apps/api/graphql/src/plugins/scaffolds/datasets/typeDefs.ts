export default /* GraphQL */ `
    type Dataset {
        id: ID!
        title: String!
        description: String
        createdOn: DateTime!
        savedOn: DateTime!
        createdBy: DatasetCreatedBy
        isPublic: Boolean!
        columns: String!
        filename: String!
    }

    type DatasetCreatedBy {
        id: String!
        type: String!
        displayName: String!
    }

    input DatasetCreateInput {
        title: String!
        description: String
        isPublic: Boolean!
        columns: String!
        filename: String!
    }

    input DatasetUpdateInput {
        title: String
        description: String
        isPublic: Boolean!
        columns: String!
        filename: String!
    }

    type DatasetsListMeta {
        limit: Number
        before: String
        after: String
    }

    enum DatasetsListSort {
        createdOn_ASC
        createdOn_DESC
    }

    type DatasetsList {
        data: [Dataset]
        meta: DatasetsListMeta
    }

    type DatasetQuery {
        # Returns a single Dataset entry.
        getDataset(id: ID!): Dataset

        # Lists one or more Dataset entries.
        listDatasets(
            limit: Int
            before: String
            after: String
            sort: DatasetsListSort
        ): DatasetsList!
    }

    type DatasetMutation {
        # Creates and returns a new Dataset entry.
        createDataset(data: DatasetCreateInput!): Dataset!

        # Updates and returns an existing Dataset entry.
        updateDataset(id: ID!, data: DatasetUpdateInput!): Dataset!

        # Deletes and returns an existing Dataset entry.
        deleteDataset(id: ID!): Dataset!
    }

    extend type Query {
        datasets: DatasetQuery
    }

    extend type Mutation {
        datasets: DatasetMutation
    }
`;
