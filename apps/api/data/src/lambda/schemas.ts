import table from "../../../../core/aws/table";
// types
import type { DatasetEntity } from "../../../graphql/src/plugins/scaffolds/datasets/types";
import type { ApiDataQueryEntity } from "../../../graphql/src/plugins/scaffolds/apiDataQueries/types";
import type { ErrorResponse, QueryResponse } from "../../../../core/types/queryApi";

type DataView = ApiDataQueryEntity | DatasetEntity;
export const CACHED_SCHEMAS = new Map<string, DataView>();

export default class SchemaService {
    async getSchema(id: string): Promise<QueryResponse<DataView, string>> {
        const schema = await this.fetchSchemaEntry(id);
        if (!schema.ok) {
            return schema;
        }
        return {
            ok: true,
            result: schema.result
        };
    };
    getSchemaSync(id: string): QueryResponse<DataView, string> {
        const schema = CACHED_SCHEMAS.get(id);
        if (!schema) {
            return {
                ok: false,
                error: `Data schema with ID "${id}" not found.`
            };
        }
        return {
            ok: true,
            result: schema
        };
    };
    generateBatchGetInput = (ids: string[]) => {
        let queries = new Array(ids.length * 2);
        for (let i = 0; i < ids.length; i += 2) {
            queries[i] = { Table: table, Key: { PK: `L#en-US#ApiDataQuery`, SK: ids[i] } };
            queries[i + 1] = { Table: table, Key: { PK: `L#en-US#Dataset`, SK: ids[i] } };
        }
        return queries;
    };

    async fetchSchemaEntry(id: string): Promise<QueryResponse<DataView, string>> {
        if (!CACHED_SCHEMAS.has(id)) {
            const tableQuery = await table.batchGet(this.generateBatchGetInput([id]));
            const entities = tableQuery?.Responses?.[table.name];
            if (entities?.length) {
                entities.forEach((element: DataView) => {
                    CACHED_SCHEMAS.set(element.id, element);
                });
            }
        }
        const schema = CACHED_SCHEMAS.get(id);

        if (!schema) {
            return {
                ok: false,
                error: `Data schema with ID "${id}" not found.`
            };
        }
        return {
            ok: true,
            result: schema
        };
    }

    async fetchMultipleSchemaEntries(ids: string[], fresh:boolean=false): Promise<QueryResponse<DataView[], string>> {
        const missingIds = fresh
            ? ids
            : ids.filter(id => !CACHED_SCHEMAS.has(id));
            
        if (missingIds.length) {
            const tableQuery = await table.batchGet(this.generateBatchGetInput(missingIds));
            const entities = tableQuery?.Responses?.[table.name];
            if (entities?.length) {
                entities.forEach((element: DataView) => {
                    CACHED_SCHEMAS.set(element.id, element);
                });
            }
        }
        const schemas = ids.map(id => CACHED_SCHEMAS.get(id)).filter(Boolean);

        if (!schemas?.length) {
            return {
                ok: false,
                error: `Data schema with ID "${ids.join(",")}" not found.`
            };
        }
        return {
            ok: true,
            result: schemas as DataView[]
        };
    }

    validateSchema(
        id: string,
    ): QueryResponse<boolean, string> {
        const schema = CACHED_SCHEMAS.get(id);
        if (!schema) {
            return {
                ok: false,
                error: `Data schema with ID "${id}" not found.`
            };
        }

        const { isPublic } = schema;

        if (!isPublic) {
            return {
                ok: false,
                error: `Data schema with ID "${id}" is not public.`
            };
        }

        return {
            ok: true,
            result: true
        };
    }

    validateSchemas(
        ids: string[],
    ): QueryResponse<Array<string>, Array<string>>{
        const schemaValidations = ids.map(id => this.validateSchema(id));
        const invalidSchemas = schemaValidations.filter(validation => !validation.ok) as Array<ErrorResponse<string>>;
        if (invalidSchemas.length) {
            return {
                ok: false,
                error: invalidSchemas.map((validation) => validation.error)
            };
        }
        return {
            ok: true,
            result: ids
        }
    }
}

export const schemaService = new SchemaService();