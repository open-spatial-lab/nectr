// @ts-ignore
import DuckDB from 'duckdb'
import { QueryResponse } from '../types/types'
import { serverSchemaService } from './schemas/serverSchemaService'
import { SqlBuilder } from './sqlBuilder'
import { logger } from '..'
// import { BucketManager } from './bucketManager'

// const bucket = new BucketManager(process.env['DATA_BUCKET']!, process.env['AWS_REGION']!)

export default class Connection {
  duckDB?: DuckDB.Database
  connection?: DuckDB.Connection
  isInitialized: boolean = false

  constructor() {}

  async initialize() {
    // this.withLogs(text => this.logs.push(text))()
    if (this.isInitialized) {
      return
    }
    this.duckDB = new DuckDB.Database(':memory:', {
      allow_unsigned_extensions: 'true'
    })

    this.connection = new DuckDB.Connection(this.duckDB)

    try {
      await this.query("SET home_directory='/tmp';")
      await this.query(`INSTALL httpfs;`)
      await this.query(`LOAD httpfs;`)
      await this.query(`INSTALL spatial;`)
      await this.query(`LOAD spatial;`)
      await this.query(`SET enable_http_metadata_cache=true;`)
      await this.query(`SET enable_object_cache=true;`)
      this.isInitialized = true
    } catch (err) {
      console.log('Failed to initialize...', err)
    }
  }

  async query(query: string): Promise<QueryResponse<any, string>> {
    return new Promise((resolve, reject) => {
      this.connection!.all(query, (err: any, res: any) => {
        if (err) {
          reject({
            error: err,
            ok: false
          })
        }
        resolve({
          result: res,
          ok: true
        })
      })
    })
  }

  async handleIdQuery(id: string, params: any): Promise<QueryResponse<any, string>> {
    const schema = await serverSchemaService.getSchema(id)
    if (!schema.ok) {
      return schema
    }
    // @ts-ignore
    return await this.handleQuery(schema.result, params)
  }
  async handleQuery(schema: DataView, params: any): Promise<QueryResponse<any, string>> {
    const sqlBuilder = new SqlBuilder(
      // @ts-ignore
      schema,
      params,
      false,
      serverSchemaService
    )
    await sqlBuilder.buildStatement()
    const query = sqlBuilder.queryString
    logger.info(`Handling query: ${JSON.stringify(query, null, 2)}`)
    try {
      const data = await this.query(query)
      return data
    } catch (err) {
      return {
        error: `Error at handle id query: ${JSON.stringify(err)}; \n Schema: \n ${JSON.stringify(
          schema
        )} \n Query: ${query}`,
        ok: false
      }
    }
  }
}
