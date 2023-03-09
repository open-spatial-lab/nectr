import {
    GET_DATA_UPLOAD,
    CREATE_DATA_UPLOAD,
    DELETE_DATA_UPLOAD,
    LIST_DATA_UPLOADS,
    UPDATE_DATA_UPLOAD
} from "./graphql/dataUploads";
import { request } from "graphql-request";

/**
 * An example of an end-to-end (E2E) test. You can use these to test if the overall cloud infrastructure
 * setup is working. That's why, here we're not executing the handler code directly, but issuing real
 * HTTP requests over to the deployed Amazon Cloudfront distribution. These tests provide the highest
 * level of confidence that our application is working, but they take more time in order to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crude2etestts
 */

const query = async ({ query = "", variables = {} } = {}) => {
    return request(process.env.API_URL + "/graphql", query, variables);
};

let testDataUploads: any[] = [];

describe("DataUploads CRUD tests (end-to-end)", () => {
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
                }).then((response: any) => response.dataUploads.createDataUpload)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            try {
                await query({
                    query: DELETE_DATA_UPLOAD,
                    variables: {
                        id: testDataUploads[i].id
                    }
                });
            } catch {
                // Some of the entries might've been deleted during runtime.
                // We can ignore thrown errors.
            }
        }
        testDataUploads = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have dataUploads created, let's see if they come up in a basic listDataUploads query.
        const [dataUpload0, dataUpload1, dataUpload2] = testDataUploads;

        await query({
            query: LIST_DATA_UPLOADS,
            variables: { limit: 3 }
        }).then((response: any) =>
            expect(response.dataUploads.listDataUploads).toMatchObject({
                data: [dataUpload2, dataUpload1, dataUpload0],
                meta: {
                    limit: 3
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
            query: LIST_DATA_UPLOADS,
            variables: {
                limit: 2
            }
        }).then((response: any) =>
            expect(response.dataUploads.listDataUploads).toMatchObject({
                data: [dataUpload2, dataUpload0],
                meta: {
                    limit: 2
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
            expect(response.dataUploads.updateDataUpload).toEqual({
                id: dataUpload0.id,
                title: "DataUpload 0 - UPDATED",
                description: `DataUpload 0's description - UPDATED.`
            })
        );

        // 4. Get dataUpload 0 after the update.
        await query({
            query: GET_DATA_UPLOAD,
            variables: {
                id: dataUpload0.id
            }
        }).then((response: any) =>
            expect(response.dataUploads.getDataUpload).toEqual({
                id: dataUpload0.id,
                title: "DataUpload 0 - UPDATED",
                description: `DataUpload 0's description - UPDATED.`
            })
        );
    });
});
