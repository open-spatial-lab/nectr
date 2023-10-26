// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox'
import table from './table'
import { ApiDataQueryEntity } from '../types'

/**
 * Once we have the table, we define the ApiDataQueryEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
// @ts-ignore
export default new Entity<ApiDataQueryEntity>({
  table,
  name: 'ApiDataQuery',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    id: { type: 'string' },
    title: { type: 'string' },
    template: { type: 'string' },
    createdOn: { type: 'string' },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },
    isPublic: { type: 'boolean', default: false },
    canView: { type: 'list', default: [] },
    canEdit: { type: 'list', default: [] },
    canDelete: { type: 'list', default: [] },
    sources: { type: 'list', default: [] },
    wheres: { type: 'list', default: [] },
    joins: { type: 'list', default: [] },
    columns: { type: 'list', default: [] },
    groupbys: { type: 'list', default: [] },
    orderbys: { type: 'list', default: [] },
    defaultParameters: {
      type: 'string',
      default: '{}'
    },
    dataViewTemplate: { type: 'string' },
    combinedOperator: { type: 'string' },
    limit: { type: 'number' },
    offset: { type: 'number' },
    // Will store current version of Webiny, for example "5.9.1".
    // Might be useful in the future or while performing upgrades.
    webinyVersion: { type: 'string' }
  }
})
