import { handler } from "~/index";
import {
    GET_API_DATA_QUERY,
    CREATE_API_DATA_QUERY,
    DELETE_API_DATA_QUERY,
    LIST_API_DATA_QUERIES,
    UPDATE_API_DATA_QUERY
} from "./graphql/apiDataQueries";

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

let testApiDataQueries: any[] = [];

describe("ApiDataQueries CRUD tests (integration)", () => {
    beforeEach(async () => {
        for (let i = 0; i < 3; i++) {
            testApiDataQueries.push(
                await query({
                    query: CREATE_API_DATA_QUERY,
                    variables: {
                        data: {
                            title: `ApiDataQuery ${i}`,
                            description: `ApiDataQuery ${i}'s description.`
                        }
                    }
                }).then((response: any) => response.data.apiDataQueries.createApiDataQuery)
            );
        }
    });

    afterEach(async () => {
        for (let i = 0; i < 3; i++) {
            await query({
                query: DELETE_API_DATA_QUERY,
                variables: {
                    id: testApiDataQueries[i].id
                }
            });
        }
        testApiDataQueries = [];
    });

    it("should be able to perform basic CRUD operations", async () => {
        // 1. Now that we have apiDataQueries created, let's see if they come up in a basic listApiDataQueries query.
        const [apiDataQuery0, apiDataQuery1, apiDataQuery2] = testApiDataQueries;

        await query({ query: LIST_API_DATA_QUERIES }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery2, apiDataQuery1, apiDataQuery0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 2. Delete apiDataQuery 1.
        await query({
            query: DELETE_API_DATA_QUERY,
            variables: {
                id: apiDataQuery1.id
            }
        });

        await query({
            query: LIST_API_DATA_QUERIES
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery2, apiDataQuery0],
                meta: {
                    after: null,
                    before: null,
                    limit: 10
                }
            })
        );

        // 3. Update apiDataQuery 0.
        await query({
            query: UPDATE_API_DATA_QUERY,
            variables: {
                id: apiDataQuery0.id,
                data: {
                    title: "ApiDataQuery 0 - UPDATED",
                    description: `ApiDataQuery 0's description - UPDATED.`
                }
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.updateApiDataQuery).toEqual({
                id: apiDataQuery0.id,
                title: "ApiDataQuery 0 - UPDATED",
                description: `ApiDataQuery 0's description - UPDATED.`
            })
        );

        // 5. Get apiDataQuery 0 after the update.
        await query({
            query: GET_API_DATA_QUERY,
            variables: { id: apiDataQuery0.id }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.getApiDataQuery).toEqual({
                id: apiDataQuery0.id,
                title: "ApiDataQuery 0 - UPDATED",
                description: `ApiDataQuery 0's description - UPDATED.`
            })
        );
    });

    test("should be able to use cursor-based pagination (desc)", async () => {
        const [apiDataQuery0, apiDataQuery1, apiDataQuery2] = testApiDataQueries;

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery2, apiDataQuery1],
                meta: {
                    after: apiDataQuery1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2,
                after: apiDataQuery1.id
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery0],
                meta: {
                    before: apiDataQuery0.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2,
                before: apiDataQuery0.id
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery2, apiDataQuery1],
                meta: {
                    after: apiDataQuery1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });

    test("should be able to use cursor-based pagination (ascending)", async () => {
        const [apiDataQuery0, apiDataQuery1, apiDataQuery2] = testApiDataQueries;

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC"
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery0, apiDataQuery1],
                meta: {
                    after: apiDataQuery1.id,
                    before: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                after: apiDataQuery1.id
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery2],
                meta: {
                    before: apiDataQuery2.id,
                    after: null,
                    limit: 2
                }
            })
        );

        await query({
            query: LIST_API_DATA_QUERIES,
            variables: {
                limit: 2,
                sort: "createdOn_ASC",
                before: apiDataQuery2.id
            }
        }).then((response: any) =>
            expect(response.data.apiDataQueries.listApiDataQueries).toEqual({
                data: [apiDataQuery0, apiDataQuery1],
                meta: {
                    after: apiDataQuery1.id,
                    before: null,
                    limit: 2
                }
            })
        );
    });
});
