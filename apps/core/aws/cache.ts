// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox'
import { Table } from 'dynamodb-toolbox'
// @ts-ignore
import { documentClient } from './documentClient'
/**
 * Everything starts with a table. Note that the `name` property is passed via an environment
 * variable, which is defined upon cloud infrastructure deployment. On the other hand, while
 * running tests, the value is read from cloud infrastructure state files (that were generated
 * during a previous deployment).
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */
const cacheName = process.env['TESTING'] == 'true' ? 'testCache' : (process.env['CACHE_TABLE'] as string)

export type CacheTableEntity = {
  PK: string
  SK: string
  timestamp: number
  id: string
}

export const cacheTable = new Table({
  name: cacheName,
  partitionKey: 'PK',
  sortKey: 'SK',
  DocumentClient: documentClient
})

/**
 * Once we have the table, we define the DataUploadEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
export default new Entity({
  table: cacheTable,
  name: 'DataCache',
  timestamps: true,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    id: { type: 'string' },
    timestamp: { type: 'number' }
  }
} as const)
