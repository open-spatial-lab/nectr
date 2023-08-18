import {cmsTable as table} from '../../../../../core/aws/table'
import type { QueryResponse } from '../../../../../core/types/queryApi'
import type { DataView } from '../../types/types'
import BaseSchemaService from './baseSchemaService'

export default class ServerSchemaService extends BaseSchemaService{
  generateBatchGetInput = (ids: string[]) => {
    let queries = new Array(ids.length * 2)
    for (let i = 0; i < ids.length; i += 2) {
      queries[i] = { Table: table, Key: { PK: `L#en-US#ApiDataQuery`, SK: ids[i] } }
      queries[i + 1] = { Table: table, Key: { PK: `L#en-US#Dataset`, SK: ids[i] } }
    }
    return queries
  }

  override async fetchSchemaEntry(id: string): Promise<QueryResponse<DataView, string>> {
    if (!this.cachedSchemas.has(id)) {
      const tableQuery = await table.batchGet(this.generateBatchGetInput([id]))
      const entities = tableQuery?.Responses?.[table.name]
      if (entities?.length) {
        entities.forEach((element: DataView) => {
          this.cachedSchemas.set(element.id, element)
        })
      }
    }
    return super.fetchSchemaEntry(id)
  }

  override async fetchMultipleSchemaEntries(
    ids: string[],
    fresh: boolean = false
  ): Promise<QueryResponse<DataView[], string>> {
    const missingIds = fresh ? ids : ids.filter(id => !this.cachedSchemas.has(id))

    if (missingIds.length) {
      const tableQuery = await table.batchGet(this.generateBatchGetInput(missingIds))
      const entities = tableQuery?.Responses?.[table.name]
      if (entities?.length) {
        entities.forEach((element: DataView) => {
          this.cachedSchemas.set(element.id, element)
        })
      }
    }
    const schemas = ids.map(id => this.cachedSchemas.get(id)).filter(Boolean)

    if (!schemas?.length) {
      return {
        ok: false,
        error: `Data schema with ID "${ids.join(',')}" not found.`
      }
    }
    return {
      ok: true,
      result: schemas as DataView[]
    }
  }
}

export const serverSchemaService = new ServerSchemaService()
