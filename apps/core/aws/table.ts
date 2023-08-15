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
const cmsName = process.env['TESTING'] == 'true' ? 'test' : (process.env.DB_TABLE as string)

export const cmsTable = new Table({
  name: cmsName,
  partitionKey: 'PK',
  sortKey: 'SK',
  entityField: 'TYPE',
  DocumentClient: documentClient
})
