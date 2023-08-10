import type { ErrorResponse, QueryResponse } from '../../../../../core/types/queryApi'
import type { DataView } from '../../types/types'
import { SchemaService } from '../../types/schemaService'

export default class BaseSchemaService implements SchemaService {
  cachedSchemas = new Map<string, DataView>()

  constructor(schemas?: DataView[]) {
    schemas && schemas.forEach(schema => this.cachedSchemas.set(schema.id, schema))
  }

  async getSchema(id: string): Promise<QueryResponse<DataView, string>> {
    const schema = await this.fetchSchemaEntry(id)
    if (!schema.ok) {
      return schema
    }
    return {
      ok: true,
      result: schema.result
    }
  }

  getSchemaSync(id: string): QueryResponse<DataView, string> {
    const schema = this.cachedSchemas.get(id)
    if (!schema) {
      return {
        ok: false,
        error: `Data schema with ID "${id}" not found.`
      }
    }
    return {
      ok: true,
      result: schema
    }
  }

  async fetchSchemaEntry(id: string): Promise<QueryResponse<DataView, string>> {
    const schema = this.cachedSchemas.get(id)

    if (!schema) {
      return {
        ok: false,
        error: `Data schema with ID "${id}" not found.`
      }
    }
    return {
      ok: true,
      result: schema
    }
  }

  async fetchMultipleSchemaEntries(
    ids: string[],
    fresh: boolean = false
  ): Promise<QueryResponse<DataView[], string>> {
    const missingIds = fresh ? ids : ids.filter(id => !this.cachedSchemas.has(id))

    if (missingIds.length) {
      return {
        ok: false,
        error: `Data schema with ID "${missingIds.join(',')}" not found.`
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

  validateSchema(id: string): QueryResponse<boolean, string> {
    const schema = this.cachedSchemas.get(id)
    if (!schema) {
      return {
        ok: false,
        error: `Data schema with ID "${id}" not found.`
      }
    }

    const { isPublic } = schema

    if (!isPublic) {
      return {
        ok: false,
        error: `Data schema with ID "${id}" is not public.`
      }
    }

    return {
      ok: true,
      result: true
    }
  }

  validateSchemas(ids: string[]): QueryResponse<Array<string>, Array<string>> {
    const schemaValidations = ids.map(id => this.validateSchema(id))
    const invalidSchemas = schemaValidations.filter(validation => !validation.ok) as Array<
      ErrorResponse<string>
    >
    if (invalidSchemas.length) {
      return {
        ok: false,
        error: invalidSchemas.map(validation => validation.error)
      }
    }
    return {
      ok: true,
      result: ids
    }
  }
}
