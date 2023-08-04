// @ts-ignore
import DuckDB from "duckdb";
import { QueryResponse } from "../types/types";
import SchemaService from "./schemas";
import { BucketManager } from "./bucketManager";
import { SqlBuilder } from "./sqlBuilder";

const schemaService = new SchemaService();
const bucket = new BucketManager(process.env["DATA_BUCKET"]!, process.env["AWS_REGION"]!);

export default class Connection {
    duckDB?: DuckDB.Database;
    connection?: DuckDB.Connection;
    isInitialized: boolean = false;

    constructor() {
    }

    async initialize() {

        if (this.isInitialized) {
            return;
        }
        this.duckDB = new DuckDB.Database(":memory:", {
            allow_unsigned_extensions: "true"
        });
        
        this.connection = new DuckDB.Connection(this.duckDB)
        
        try {
            await this.query("SET home_directory='/tmp';")
            await this.query(`INSTALL httpfs;`)
            await this.query(`LOAD httpfs;`)
            await this.query(`INSTALL spatial;`)
            await this.query(`LOAD spatial;`)
            await this.query(`SET enable_http_metadata_cache=true;`);
            await this.query(`SET enable_object_cache=true;`);
            this.isInitialized = true;
        } catch (err) {
            console.log("Failed to initialize...", err);
        }
    }

    async query(query: string): Promise<QueryResponse<any, string>> {
        return new Promise((resolve, reject) => {
            try {
                this.connection!.all(query, (err: any, res: any) => {
                    if (err) {
                        reject({
                            error: err,
                            ok: false
                        });
                    }
                    resolve({
                        result: res,
                        ok: true
                    });
                });
            } catch (err) {
                reject({
                    error: err,
                    ok: false
                });
            }
        });
    }

    // async handleRawQuery(body: string): Promise<QueryResponse<any, string>> {
    //     try {
    //         const json = JSON.parse(body);
    //         const query = json.query;
    //         console.log('RAW QUERY', query)
    //         const data = await this.query(query);
    //         return data
    //     } catch (error) {
    //         const errorText = JSON.stringify(error);
    //         return {
    //             error: `Error at handle raw query: ${errorText}`,
    //             ok: false
    //         };
    //     }
    // }

    async handleIdQuery(id: string, params: any): Promise<QueryResponse<any, string>> {
        const schema = await schemaService.getSchema(id);

        if (!schema.ok) {
            return schema;
        }
        const sqlBuilder = new SqlBuilder(
            // @ts-ignore
            schema.result,
            params,
        )
        await sqlBuilder.buildStatement();
        const query = sqlBuilder.queryString;
        try {
            const data = await this.query(query);
            return data;
        } catch (err) {
            console.log(err);
            console.log(JSON.stringify(schema, null, 2));
            return {
                error: `Error at handle id query: ${JSON.stringify(
                    err
                )}; \n Schema: \n ${JSON.stringify(schema)} \n Query: ${query}`,
                ok: false
            };
        }
    }
}
