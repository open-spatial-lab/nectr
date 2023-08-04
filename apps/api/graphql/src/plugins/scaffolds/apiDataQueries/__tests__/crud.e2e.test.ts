import {
  GET_API_DATA_QUERY,
  CREATE_API_DATA_QUERY,
  DELETE_API_DATA_QUERY,
  LIST_API_DATA_QUERIES,
  UPDATE_API_DATA_QUERY
} from './graphql/apiDataQueries'
import { request } from 'graphql-request'

/**
 * An example of an end-to-end (E2E) test. You can use these to test if the overall cloud infrastructure
 * setup is working. That's why, here we're not executing the handler code directly, but issuing real
 * HTTP requests over to the deployed Amazon Cloudfront distribution. These tests provide the highest
 * level of confidence that our application is working, but they take more time in order to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crude2etestts
 */

const query = async ({ query = '', variables = {} } = {}) => {
  return request(process.env.API_URL + '/graphql', query, variables)
}

let testApiDataQueries: any[] = []

describe('ApiDataQueries CRUD tests (end-to-end)', () => {
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
        }).then((response: any) => response.apiDataQueries.createApiDataQuery)
      )
    }
  })

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_API_DATA_QUERY,
          variables: {
            id: testApiDataQueries[i].id
          }
        })
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testApiDataQueries = []
  })

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have apiDataQueries created, let's see if they come up in a basic listApiDataQueries query.
    const [apiDataQuery0, apiDataQuery1, apiDataQuery2] = testApiDataQueries

    await query({
      query: LIST_API_DATA_QUERIES,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.apiDataQueries.listApiDataQueries).toMatchObject({
        data: [apiDataQuery2, apiDataQuery1, apiDataQuery0],
        meta: {
          limit: 3
        }
      })
    )

    // 2. Delete apiDataQuery 1.
    await query({
      query: DELETE_API_DATA_QUERY,
      variables: {
        id: apiDataQuery1.id
      }
    })

    await query({
      query: LIST_API_DATA_QUERIES,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.apiDataQueries.listApiDataQueries).toMatchObject({
        data: [apiDataQuery2, apiDataQuery0],
        meta: {
          limit: 2
        }
      })
    )

    // 3. Update apiDataQuery 0.
    await query({
      query: UPDATE_API_DATA_QUERY,
      variables: {
        id: apiDataQuery0.id,
        data: {
          title: 'ApiDataQuery 0 - UPDATED',
          description: `ApiDataQuery 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.apiDataQueries.updateApiDataQuery).toEqual({
        id: apiDataQuery0.id,
        title: 'ApiDataQuery 0 - UPDATED',
        description: `ApiDataQuery 0's description - UPDATED.`
      })
    )

    // 4. Get apiDataQuery 0 after the update.
    await query({
      query: GET_API_DATA_QUERY,
      variables: {
        id: apiDataQuery0.id
      }
    }).then((response: any) =>
      expect(response.apiDataQueries.getApiDataQuery).toEqual({
        id: apiDataQuery0.id,
        title: 'ApiDataQuery 0 - UPDATED',
        description: `ApiDataQuery 0's description - UPDATED.`
      })
    )
  })
})
