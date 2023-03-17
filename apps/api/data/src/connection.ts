// @ts-ignore
import DuckDB from "duckdb";
import { QueryResponse } from "./types";
import QuerySchemas from "./schemas";

const schemas = new QuerySchemas();

export default class Connection {
    duckDB: DuckDB.Database;
    connection: DuckDB.Connection;
    isInitialized: boolean = false;

    constructor() {
        this.duckDB = new DuckDB.Database(":memory:");
        this.connection = this.duckDB.connect();
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            await this.query(`SET home_directory='/tmp';`);
            await this.query(`INSTALL httpfs;`);
            await this.query(`LOAD httpfs;`);
            await this.query(`SET enable_http_metadata_cache=true;`);
            await this.query(`SET enable_object_cache=true;`);
            this.isInitialized = true;
        } catch (err) {
            console.log('Failed to initialize...', err)
        }
    }

    async query(query: string): Promise<QueryResponse<any, string>> {
        return new Promise((resolve, reject) => {
            this.connection.all(query, (err: any, res: any) => {
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
        });
    }

    async handleRawQuery(body: string): Promise<QueryResponse<any, string>> {
        try {
            const json = JSON.parse(body);
            const query = json.query;
            const data = await this.query(query);
            return data
        } catch (err) {
            return {
                error: err,
                ok: false
            };
        }
    }

    async handleIdQuery(id: string, params: any): Promise<QueryResponse<any, string>> {
        const schema = await schemas.handleRequest({
            id,
            params
        });

        if (!schema.ok) {
            return schema
        }

        try {
            const data = await this.query(schema.result);
            return data;
        } catch (err) {
            console.log('ERR', JSON.stringify(err, null, 2))
            return {
                error: err,
                ok: false,
            };
        }
    }
}
