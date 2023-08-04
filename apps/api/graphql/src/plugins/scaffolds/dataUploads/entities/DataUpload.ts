// https://github.com/jeremydaly/dynamodb-toolbox
import { Entity } from 'dynamodb-toolbox'
import table from './table'
import type { DataUploadEntity } from '../types'

/**
 * Once we have the table, we define the DataUploadEntity entity.
 * If needed, additional entities can be defined using the same approach.
 */
export default new Entity({
  table,
  name: 'DataUpload',
  timestamps: false,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    createdOn: { type: 'string' },
    isPublic: { type: 'boolean', default: false },
    canView: { type: 'list', default: [] },
    canEdit: { type: 'list', default: [] },
    canDelete: { type: 'list', default: [] },
    savedOn: { type: 'string' },
    createdBy: { type: 'map' },
    webinyVersion: { type: 'string' },
    columns: { type: 'string' }
  }
} as const)
