/**
 * Contains all of the GraphQL queries and mutations that we might need while writing our tests.
 * If needed, feel free to add more.
 */

export const GET_DATA_UPLOAD = /* GraphQL */ `
    query GetDataUpload($id: ID!) {
        dataUploads {
            getDataUpload(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const CREATE_DATA_UPLOAD = /* GraphQL */ `
    mutation CreateDataUpload($data: DataUploadCreateInput!) {
        dataUploads {
            createDataUpload(data: $data) {
                id
                title
                description
                isPublic
            }
        }
    }
`;

export const UPDATE_DATA_UPLOAD = /* GraphQL*/ `
    mutation UpdateDataUpload($id: ID!, $data: DataUploadUpdateInput!) {
        dataUploads {
            updateDataUpload(id: $id, data: $data) {
                id
                title
                description
                isPublic
            }
        }
    }
`;

export const DELETE_DATA_UPLOAD = /* GraphQL */ `
    mutation DeleteDataUpload($id: ID!) {
        dataUploads {
            deleteDataUpload(id: $id) {
                id
                title
                description
            }
        }
    }
`;

export const LIST_DATA_UPLOADS = /* GraphQL */ `
    query ListDataUploads($sort: DataUploadsListSort, $limit: Int, $after: String) {
        dataUploads {
            listDataUploads(sort: $sort, limit: $limit, after: $after) {
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
`;
