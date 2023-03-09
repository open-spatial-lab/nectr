import { handler } from "~/index";
import {
    GET_DATA_UPLOAD,
    CREATE_DATA_UPLOAD,
    DELETE_DATA_UPLOAD,
    LIST_DATA_UPLOADS,
    UPDATE_DATA_UPLOAD
} from "./graphql/dataUploads";

/**
 * An example of an integration test. You can use these to test your GraphQL resolvers, for example,
 * ensure they are correctly interacting with the database and other cloud infrastructure resources
 * and services. These tests provide a good level of confidence that our application is working, and
 * can be reasonably fast to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crudintegrationtestts
 */

const query = ({ query = "", variables = {} } = {}) => {
    return handler({
        httpMethod: "POST",
        headers: {},
        body: JSON.stringify({
            query,
            variables
        })
    }).then((response: any) => JSON.parse(response.body));
};

let testDataUploads: any[] = [];

describe("DataUploads CRUD tests (integration)", () => {
    beforeEach(async () => {
        for (let i = 0; i < 3; i++) {
            testDataUploads.push(
                await query({
                    query: CREATE_DATA_UPLOAD,
                    variables: {
                        data: {
                            title: `DataUpload ${i}`,
                            description: `DataUpload ${i}'s description.`
                        }
                    }
                }).then((response: any) => response.data.dataUploads.createDataUpload)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            await query({
                query: DELETE_DATA_UPLOAD,
                variables: {
                    id: testDataUploads[i].id
                }
            });
        }
        testDataUploads = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have dataUploads created, let's see if they come up in a basic listDataUploads query.
        const [dataUpload0, dataUpload1, dataUpload2] = testDataUploads;

        await query({ query: LIST_DATA_UPLOADS }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload2, dataUpload1, dataUpload0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 2. Delete dataUpload 1.
        await query({
            query: DELETE_DATA_UPLOAD,
            variables: {
                id: dataUpload1.id
            }
        });

        await query({
            query: LIST_DATA_UPLOADS
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload2, dataUpload0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 3. Update dataUpload 0.
        await query({
            query: UPDATE_DATA_UPLOAD,
            variables: {
                id: dataUpload0.id,
                data: {
                    title: "DataUpload 0 - UPDATED",
                    description: `DataUpload 0's description - UPDATED.`
                }
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.updateDataUpload).toEqual({
                id: dataUpload0.id,
                title: "DataUpload 0 - UPDATED",
                description: `DataUpload 0's description - UPDATED.`
            })
        );

        // 5. Get dataUpload 0 after the update.
        await query({
            query: GET_DATA_UPLOAD,
            variables: { id: dataUpload0.id }
        }).then((response: any) =>
            expect(response.data.dataUploads.getDataUpload).toEqual({
                id: dataUpload0.id,
                title: "DataUpload 0 - UPDATED",
                description: `DataUpload 0's description - UPDATED.`
            })
        );
    });

    test("should be able to use cursor-based pagination (desc)", async () => {
        const [dataUpload0, dataUpload1, dataUpload2] = testDataUploads;

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload2, dataUpload1],
                meta: {
                    after: dataUpload1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2,
                after: dataUpload1.id
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload0],
                meta: {
                    before: dataUpload0.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2,
                before: dataUpload0.id
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload2, dataUpload1],
                meta: {
                    after: dataUpload1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });

    test("should be able to use cursor-based pagination (ascending)", async () => {
        const [dataUpload0, dataUpload1, dataUpload2] = testDataUploads;

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC"
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload0, dataUpload1],
                meta: {
                    after: dataUpload1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                after: dataUpload1.id
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload2],
                meta: {
                    before: dataUpload2.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                before: dataUpload2.id
            }
        }).then((response: any) =>
            expect(response.data.dataUploads.listDataUploads).toEqual({
                data: [dataUpload0, dataUpload1],
                meta: {
                    after: dataUpload1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });
});
