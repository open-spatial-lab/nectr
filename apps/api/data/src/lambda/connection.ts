import DuckDB, {DuckDbError, type TableData} from 'duckdb'
import { QueryResponse } from '../types/types'
import { serverSchemaService } from './schemas/serverSchemaService'
import { SqlBuilder } from './sqlBuilder'
import { logger } from '..'
import { ApiDataQueryEntity } from '../../../graphql/src/plugins/scaffolds/apiDataQueries/types'

export default class Connection {
  duckDB?: DuckDB.Database
  connection?: DuckDB.Connection
  isInitialized: boolean = false

  constructor() {}

  async initialize() {
    if (this.isInitialized) {
      return
    }
    this.duckDB = new DuckDB.Database(':memory:', {
      allow_unsigned_extensions: 'true'
    })

    this.connection = new DuckDB.Connection(this.duckDB)

    try {
      // await this.query(`SET threads TO 6;`)
      // await this.query(`SET memory_limit='10GB';`)
      // await this.query(`SET wal_autocheckpoint='1GB';`)
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

  async query(query: string): Promise<QueryResponse<TableData, string>> {
    return new Promise((resolve, reject) => {
      this.connection!.all(query, (err: DuckDbError | null, res: TableData) => {
        if (err) {
          resolve({
            error: err.stack || 'Unknown error',
            ok: false
          })
        } else {
          resolve({
            result: res,
            ok: true
          })
        }
      })
    })
  }

  async handleIdQuery(id: string, params: Record<string,unknown>): Promise<QueryResponse<TableData, string>> {

    // @ts-ignore these types are interchangeable TODO cleanup data view vs api query
    return await this.handleQuery(schema.result, params)
  }
  async handleQuery(schema: DataView | ApiDataQueryEntity, params: Record<string,unknown>): Promise<QueryResponse<TableData, string>> {
    const sqlBuilder = new SqlBuilder(
      // @ts-ignore
      schema,
      params,
      false,
      serverSchemaService
    )
    await sqlBuilder.buildStatement()
    const query = sqlBuilder.queryString
    logger.info({
      sqlQuery: query
    })
    try {
      const result = await this.query(query)
      if (result.ok) {
        return {
          ok: true,
          result: result.result
        }
      } else {
        return result
      }
      return result
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
