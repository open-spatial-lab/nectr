import {
  GET_DATASET,
  CREATE_DATASET,
  DELETE_DATASET,
  LIST_DATASETS,
  UPDATE_DATASET
} from './graphql/datasets'
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

let testDatasets: any[] = []

describe('Datasets CRUD tests (end-to-end)', () => {
  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      testDatasets.push(
        await query({
          query: CREATE_DATASET,
          variables: {
            data: {
              title: `Dataset ${i}`,
              description: `Dataset ${i}'s description.`
            }
          }
        }).then((response: any) => response.datasets.createDataset)
      )
    }
  })

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await query({
          query: DELETE_DATASET,
          variables: {
            id: testDatasets[i].id
          }
        })
      } catch {
        // Some of the entries might've been deleted during runtime.
        // We can ignore thrown errors.
      }
    }
    testDatasets = []
  })

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have datasets created, let's see if they come up in a basic listDatasets query.
    const [dataset0, dataset1, dataset2] = testDatasets

    await query({
      query: LIST_DATASETS,
      variables: { limit: 3 }
    }).then((response: any) =>
      expect(response.datasets.listDatasets).toMatchObject({
        data: [dataset2, dataset1, dataset0],
        meta: {
          limit: 3
        }
      })
    )

    // 2. Delete dataset 1.
    await query({
      query: DELETE_DATASET,
      variables: {
        id: dataset1.id
      }
    })

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.datasets.listDatasets).toMatchObject({
        data: [dataset2, dataset0],
        meta: {
          limit: 2
        }
      })
    )

    // 3. Update dataset 0.
    await query({
      query: UPDATE_DATASET,
      variables: {
        id: dataset0.id,
        data: {
          title: 'Dataset 0 - UPDATED',
          description: `Dataset 0's description - UPDATED.`
        }
      }
    }).then((response: any) =>
      expect(response.datasets.updateDataset).toEqual({
        id: dataset0.id,
        title: 'Dataset 0 - UPDATED',
        description: `Dataset 0's description - UPDATED.`
      })
    )

    // 4. Get dataset 0 after the update.
    await query({
      query: GET_DATASET,
      variables: {
        id: dataset0.id
      }
    }).then((response: any) =>
      expect(response.datasets.getDataset).toEqual({
        id: dataset0.id,
        title: 'Dataset 0 - UPDATED',
        description: `Dataset 0's description - UPDATED.`
      })
    )
  })
})
