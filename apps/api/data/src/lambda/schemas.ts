import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { formatSql } from "../../../../core/utils/formatSql";
import table from "../../../../core/aws/table";
import { s3, DATA_S3_BUCKET, S3_BUCKET } from "../../../../core/aws/s3";
// types
import type { DataUploadEntity } from "../../../graphql/src/plugins/scaffolds/dataUploads/types";
import type { ApiDataQueryEntity } from "../../../graphql/src/plugins/scaffolds/apiDataQueries/types";
import type { QueryResponse, SchemaIdAndParams, SqlString } from "../../../../core/types/queryApi";
import type { SelectQuery } from "../../../../admin/src/components/QueryBuilder/types";
import { ResultCacheEntity } from "../types/cacheEntity";
import { v4 as uuid } from 'uuid';
import Papa from "papaparse";

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
        QueryResponse<{ template: SelectQuery; templateParams: { [key: string]: any } }, string>
    > {
        const { template, isPublic } = schema;

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

        const parsedTemplate = JSON.parse(template);

        return {
            ok: true,
            result: {
                template: parsedTemplate,
                templateParams: req.params
            }
        };
    }
    getCacheKey(params: APIGatewayProxyEventQueryStringParameters
        ){
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {} as APIGatewayProxyEventQueryStringParameters);
        const cacheKey = JSON.stringify(sortedParams);
        return cacheKey
    }
    async checkCache(
        id: string,
        params: APIGatewayProxyEventQueryStringParameters
    ) // : Promise<QueryResponse<{CACHED_FILE: string}, string>>
    {
        const cacheKey = this.getCacheKey(params)

        const options = {
            filters: [{ attr: "content", eq: cacheKey }]
        };

        const cachedEntry = await table.query(`CACHE#${id}`, options);
        console.log(cachedEntry);
    }

    async cacheResult(
        id: string,
        params: APIGatewayProxyEventQueryStringParameters,
        result: string | Object
    ) {
        const timeStamp = +(new Date());
        const fileSuffix = params["format"] === "csv" ? ".csv" : ".json";
        const fileId = `${id}-${timeStamp}${fileSuffix}`;
        const cacheKey = this.getCacheKey(params)

        const entry = {
            PK: `CACHE#${id}`,
            SK: timeStamp,
            id: fileId,
            content: cacheKey
        };
        try {
            const id = uuid()
            const stringifiedResult = params["format"] === "csv" ? Papa.unparse(result) : JSON.stringify(result);
                
            const putResult = await s3
                .putObject({
                    Bucket: DATA_S3_BUCKET,
                    Key: id,
                    Body: stringifiedResult,
                    ContentType: params["format"] === "csv" ? "text/csv" : "application/json",
                    ACL: "public-read"
                })
                .promise();
        } catch(err){
            console.log('s3 put err', JSON.stringify(err));
        }
        try {
            const entryResult = await ResultCacheEntity.put(entry);
        } catch (err) {
            console.log('ddb put err', JSON.stringify(err));
        }
        // const [putResult, entryResult] = await Promise.all([
        //     s3
        //         .putObject({
        //             Bucket: S3_BUCKET,
        //             Key: fileId,
        //             Body: typeof result === "string" ? result : JSON.stringify(result),
        //             ContentType: params["format"] === "csv" ? "text/csv" : "application/json",
        //             ACL: "public-read"
        //         })
        //         .promise(),
        //     ResultCacheEntity.put(entry)
        // ]);
        // console.log(putResult, entryResult);
    }

    async handleRequest(req: SchemaIdAndParams): Promise<QueryResponse<SqlString, string>> {
        const schemaEntry = await this.fetchSchemaEntry(req.id);
        if (!schemaEntry.ok) return schemaEntry;
        const validatedEntry = await this.validateEntry(schemaEntry.result, req);
        if (!validatedEntry.ok) return validatedEntry;
        const sql = formatSql(validatedEntry.result);
        return sql;
    }
}
