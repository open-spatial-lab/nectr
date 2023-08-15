import { handler } from '~/index'
import {
  GET_DATASET,
  CREATE_DATASET,
  DELETE_DATASET,
  LIST_DATASETS,
  UPDATE_DATASET
} from './graphql/datasets'

/**
 * An example of an integration test. You can use these to test your GraphQL resolvers, for example,
 * ensure they are correctly interacting with the database and other cloud infrastructure resources
 * and services. These tests provide a good level of confidence that our application is working, and
 * can be reasonably fast to complete.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#crudintegrationtestts
 */

const query = ({ query = '', variables = {} } = {}) => {
  return handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify({
      query,
      variables
    })
  }).then((response: any) => JSON.parse(response.body))
}

let testDatasets: any[] = []

describe('Datasets CRUD tests (integration)', () => {
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
        }).then((response: any) => response.data.datasets.createDataset)
      )
    }
  })

  afterEach(async () => {
    for (let i = 0; i < 3; i++) {
      await query({
        query: DELETE_DATASET,
        variables: {
          id: testDatasets[i].id
        }
      })
    }
    testDatasets = []
  })

  it('should be able to perform basic CRUD operations', async () => {
    // 1. Now that we have datasets created, let's see if they come up in a basic listDatasets query.
    const [dataset0, dataset1, dataset2] = testDatasets

    await query({ query: LIST_DATASETS }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset2, dataset1, dataset0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      query: LIST_DATASETS
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset2, dataset0],
        meta: {
          after: null,
          before: null,
          limit: 10
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
      expect(response.data.datasets.updateDataset).toEqual({
        id: dataset0.id,
        title: 'Dataset 0 - UPDATED',
        description: `Dataset 0's description - UPDATED.`
      })
    )

    // 5. Get dataset 0 after the update.
    await query({
      query: GET_DATASET,
      variables: { id: dataset0.id }
    }).then((response: any) =>
      expect(response.data.datasets.getDataset).toEqual({
        id: dataset0.id,
        title: 'Dataset 0 - UPDATED',
        description: `Dataset 0's description - UPDATED.`
      })
    )
  })

  test('should be able to use cursor-based pagination (desc)', async () => {
    const [dataset0, dataset1, dataset2] = testDatasets

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset2, dataset1],
        meta: {
          after: dataset1.id,
          before: null,
          limit: 2
        }
      })
    )

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2,
        after: dataset1.id
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset0],
        meta: {
          before: dataset0.id,
          after: null,
          limit: 2
        }
      })
    )

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2,
        before: dataset0.id
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset2, dataset1],
        meta: {
          after: dataset1.id,
          before: null,
          limit: 2
        }
      })
    )
  })

  test('should be able to use cursor-based pagination (ascending)', async () => {
    const [dataset0, dataset1, dataset2] = testDatasets

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC'
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset0, dataset1],
        meta: {
          after: dataset1.id,
          before: null,
          limit: 2
        }
      })
    )

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        after: dataset1.id
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset2],
        meta: {
          before: dataset2.id,
          after: null,
          limit: 2
        }
      })
    )

    await query({
      query: LIST_DATASETS,
      variables: {
        limit: 2,
        sort: 'createdOn_ASC',
        before: dataset2.id
      }
    }).then((response: any) =>
      expect(response.data.datasets.listDatasets).toEqual({
        data: [dataset0, dataset1],
        meta: {
          after: dataset1.id,
          before: null,
          limit: 2
        }
      })
    )
  })
})
