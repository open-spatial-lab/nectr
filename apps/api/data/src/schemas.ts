import { Table } from "dynamodb-toolbox";
import { DataUploadEntity } from "../../graphql/src/plugins/scaffolds/dataUploads/types";
import { ApiDataQueryEntity } from "../../graphql/src/plugins/scaffolds/apiDataQueries/types";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { QueryResponse, SchemaIdAndParams, SqlString } from "./types";
import Mustache from "mustache";
import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda"

const documentClient = new DocumentClient({
    convertEmptyValues: true,
    region: process.env.AWS_REGION
});

const table = new Table({
    name: process.env.DB_TABLE as string,
    partitionKey: "PK",
    sortKey: "SK",
    entityField: "TYPE",
    DocumentClient: documentClient
});

export default class QuerySchemas {
    async fetchSchemaEntry(id: string): Promise<QueryResponse<ApiDataQueryEntity, string>> {
        const dataSchemas = await table.query("L#en-US#ApiDataQuery");
        const schemas = dataSchemas.Items ? (dataSchemas.Items as ApiDataQueryEntity[]) : [];
        const schema = schemas.find(item => item.id === id);

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

    async validateEntry(
        schema: ApiDataQueryEntity,
        req: SchemaIdAndParams
    ): Promise<
        QueryResponse<{ template: string; templateParams: { [key: string]: any } }, string>
    > {
        const { defaultParameters, template, isPublic } = schema;

        if (!isPublic) {
            return {
                ok: false,
                error: `Data schema with ID "${schema.id}" is not public.`
            };
        }

        if (!template) {
            return {
                ok: false,
                error: `Data schema with ID "${schema.id}" does not have a template.`
            };
        }

        const parsedDefaultParameters = JSON.parse(defaultParameters || "{}");
        const templateParams = {
            ...parsedDefaultParameters,
            ...req.params
        };
        return {
            ok: true,
            result: {
                template,
                templateParams
            }
        };
    }

    formatSql(params: {
        template: string;
        templateParams: { [key: string]: any };
    }): QueryResponse<string, string> {
        try {
            console.log('TEMPLATE PARAMS', params.templateParams)
            const template = params.template.replace(/(\r\n|\n|\r)/gm, " ");
            const sqlString = Mustache.render(template, params.templateParams) + ';'
            return {
                ok: true,
                result: sqlString
            };
        } catch (e) {
            return {
                ok: false,
                error: e.message
            };
        }
    }

    async handleRequest(req: SchemaIdAndParams): Promise<QueryResponse<SqlString, string>> {
        const schemaEntry = await this.fetchSchemaEntry(req.id);
        if (!schemaEntry.ok) return schemaEntry;
        const validatedEntry = await this.validateEntry(schemaEntry.result, req);
        if (!validatedEntry.ok) return validatedEntry;
        const sql = this.formatSql(validatedEntry.result);
        return sql;
    }
}
