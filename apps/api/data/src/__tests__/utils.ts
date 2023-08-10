import { CACHED_SCHEMAS } from '../lambda/schemas/serverSchemaService'

// config
const testIdentity = {
  displayName: 'test',
  id: 'test',
  type: 'admin'
}
export const DATASET_TEST_PROPERTIES = {
  title: 'test',
  createdOn: 'test',
  savedOn: 'test',
  createdBy: testIdentity,
  webinyVersion: 'test',
  columns: [],
  PK: 'test',
  SK: 'test',
  description: 'test',
  id: 'test',
  TYPE: 'source',
  isPublic: true
}

export const API_DATA_QUERY_TEST_PROPERTIES = {
  PK: 'test',
  SK: 'test',
  id: 'test',
  title: 'test',
  createdOn: 'test',
  savedOn: 'test',
  isPublic: true,
  createdBy: testIdentity,
  webinyVersion: '-1',
  type: 'ApiDataQuery',
  TYPE: 'ApiDataQuery'
}
// data mocks
export const mockSourceSpecs = () => {
  const exampleSourceSpecs = {
    sdoh: {
      ...DATASET_TEST_PROPERTIES,
      filename: 'sdoh.csv'
    },
    'sdoh-join': {
      ...DATASET_TEST_PROPERTIES,
      filename: 'sdoh-join.csv'
    },
    'other-join': {
      ...DATASET_TEST_PROPERTIES,
      filename: 'other-join.parquet'
    },
    dataview: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      TYPE: 'dataview',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset',
          TYPE: 'Dataset'
        },
        {
          id: 'other-join',
          type: 'Dataset'
        }
      ],
      columns: [
        {
          sourceId: 'sdoh',
          name: 'column1'
        },
        {
          sourceId: 'sdoh',
          name: 'column2'
        },
        {
          sourceId: 'other-join',
          name: 'column3'
        }
      ],
      joins: [
        {
          leftSourceId: 'sdoh',
          rightSourceId: 'other-join',
          leftOn: 'column1',
          rightOn: 'column3',
          operator: 'inner'
        }
      ],
      wheres: [
        {
          sourceId: 'sdoh',
          column: 'column1',
          operator: '>',
          value: 0
        }
      ]
    }
  }

  Object.entries(exampleSourceSpecs).forEach(([sourceId, sourceSpec]) => {
    // @ts-ignore
    CACHED_SCHEMAS.set(sourceId, sourceSpec)
  })
}
