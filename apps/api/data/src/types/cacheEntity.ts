import { Entity } from 'dynamodb-toolbox'
import {cmsTable as table} from '../../../../core/aws/table'
import { TableData } from 'duckdb'

export interface ResultCacheSchema {
  PK: string
  SK: string
  id: string
  createdOn: string
  content: string
}

export const ResultCacheEntity = new Entity({
  table,
  name: 'ResultCache',
  timestamps: true,
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    id: { type: 'string' },
    createdOn: { type: 'string' },
    content: { type: 'string' }
  }
})

export type MetaDataResponse = {
  columns: string
  preview: TableData
}
export type DataOutputs = TableData | MetaDataResponse