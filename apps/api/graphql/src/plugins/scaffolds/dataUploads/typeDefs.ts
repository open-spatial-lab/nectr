export default /* GraphQL */ `
    type DataUpload {
        id: ID!
        title: String!
        description: String
        createdOn: DateTime!
        // isPublic: Boolean
        // columns: String
        // canView: [String]
        // canEdit: [String]
        // canDelete: [String]
        // savedOn: DateTime!
        createdBy: DataUploadCreatedBy
    }

    type DataUploadCreatedBy {
        id: String!
        type: String!
        displayName: String!
    }

    input DataUploadCreateInput {
        title: String!
        description: String
        // isPublic: Boolean
        // columns: String
        // canView: [String]
        // canEdit: [String]
        // canDelete: [String]
    }

    input DataUploadUpdateInput {
        title: String
        description: String
        // isPublic: Boolean
        // canView: [String]
        // canEdit: [String]
        // canDelete: [String]
        // columns: String
    }

    type DataUploadsListMeta {
        limit: Number
        before: String
        after: String
    }

    enum DataUploadsListSort {
        createdOn_ASC
        createdOn_DESC
    }

    type DataUploadsList {
        data: [DataUpload]
        meta: DataUploadsListMeta
    }

    type DataUploadQuery {
        # Returns a single DataUpload entry.
        getDataUpload(id: ID!): DataUpload

        # Lists one or more DataUpload entries.
        listDataUploads(
            limit: Int
            before: String
            after: String
            sort: DataUploadsListSort
        ): DataUploadsList!
    }

    type DataUploadMutation {
        # Creates and returns a new DataUpload entry.
        createDataUpload(data: DataUploadCreateInput!): DataUpload!

        # Updates and returns an existing DataUpload entry.
        updateDataUpload(id: ID!, data: DataUploadUpdateInput!): DataUpload!

        # Deletes and returns an existing DataUpload entry.
        deleteDataUpload(id: ID!): DataUpload!
    }

    extend type Query {
        dataUploads: DataUploadQuery
    }

    extend type Mutation {
        dataUploads: DataUploadMutation
    }
`
