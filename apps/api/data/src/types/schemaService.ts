import { DataView, QueryResponse } from "./types";

export abstract class SchemaService {
  abstract cachedSchemas: Map<string, DataView> 
  abstract getSchema(id: string): Promise<QueryResponse<DataView, string>>
  abstract getSchemaSync(id: string): QueryResponse<DataView, string>
  abstract fetchSchemaEntry(id: string): Promise<QueryResponse<DataView, string>>
  abstract validateSchema(id: string): QueryResponse<boolean, string>
  abstract fetchMultipleSchemaEntries(ids: string[], fresh: boolean): Promise<QueryResponse<DataView[], string>>
}