import { deflate } from 'zlib'
import CacheEntity, { CacheTableEntity, cacheTable } from '../../../../core/aws/cache'
import { QueryResponse } from '../types/types'
import * as s3 from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import { logger } from '..'
import corsHeaders from '../utils/corsHeaders'
import { TableData } from 'duckdb'
import { DataOutputs } from '../types/cacheEntity'
import * as Papa from 'papaparse'
import { pack } from 'msgpackr';
export default class CacheService {
  s3: s3.S3
  bucket: string = process.env['DATA_BUCKET']!
  region: string = process.env['AWS_REGION']!
  PK: string = ''
  SK: string = ''
  params: Record<string, unknown> = {}
  format: "json" | "csv" | "msgpack" = "json"

  constructor(id: string, params: Record<string, unknown>) {
    this.PK = id
    this.params = params
    this.s3 = new s3.S3({ region: this.region })
    if ('format' in params) {
      this.format = params?.['format'] as "json" | "csv" | "msgpack"
    }
  }

  compressParams(params: Record<string, unknown>) {
    if (Object.keys(params).length === 0) {
      return 'noparams'
    }
    return new Promise((resolve, reject) => {
      deflate(JSON.stringify(params), (e, result) => {
        if (e) {
          reject(e)
        }
        const stringifiedResult = result.toString('base64')
        resolve(stringifiedResult)
      })
    })
  }

  async checkCache(): Promise<QueryResponse<{ Item?: Partial<CacheTableEntity> }, string>> {
    const SK = (await this.compressParams(this.params)) as string
    if (!SK) {
      return {
        ok: false,
        error: 'No params'
      }
    }
    this.SK = SK
    const PK = this.PK
    const cachedEntry = await CacheEntity.get({ PK, SK })
    if (cachedEntry?.Item?.id) {
      return {
        ok: true,
        result: cachedEntry
      }
    } else {
      return {
        ok: false,
        error: 'No cached entry'
      }
    }
  }

  getKey(key: string){
    switch(this.format){
      case "json":
        return `cache/${key}.json`
      case "csv":
        return `cache/${key}.csv`
      case "msgpack":
        return `cache/${key}.msgpack`
      default:
        return `cache/${key}.json`
    }
  }

  getContentType(){
    switch(this.format){
      case "json":
        return 'application/json'
      case "csv":
        return 'text/csv'
      case "msgpack":
        return 'application/octet-stream'
      default:
        return 'application/json'
    }
  }
  formatData(data: DataOutputs){
    switch(this.format){
      case "json":
        return JSON.stringify(data)
      case "csv":
        if (Array.isArray(data)) {
          return Papa.unparse(data)
        } else {
          return Papa.unparse(data.preview)
        }
      case "msgpack":
        return pack(data)
      default:
        return JSON.stringify(data)
    }
  }

  async putData(key: string, data: DataOutputs) {
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: this.getKey(key),
      ContentType: this.getContentType(),
      Body: this.formatData(data)
    })
  }

  async cacheTable(fileId: string) {
    // logger.info({
    //   message: 'Caching table',
    //   config: {
    //     PK: this.PK,
    //     SK: this.SK,
    //     id: fileId,
    //     timestamp: Math.floor(Date.now() / 1000)
    //   }
    // })
    // return await CacheEntity.put({
    //   PK: this.PK,
    //   SK: this.SK,
    //   id: fileId,
    //   timestamp: Math.floor(Date.now() / 1000)
    // })
  }

  async handleResult(output: QueryResponse<TableData, unknown>) {
    if (output.ok) {
      const cacheFileId = await this.cacheResult(output.result)
      return this.redirectToCacheFile(cacheFileId)
    } else {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders
        },
        body: JSON.stringify({ error: output.error })
      }
    }
  }

  async cacheResult(data: DataOutputs) {
    const fileId = nanoid()
    await Promise.all([
      this.cacheTable(fileId), 
      this.putData(fileId, data)
    ])
    return fileId
  }

  redirectToCacheFile(cacheFileId: string) {
    return {
      statusCode: 302,
      headers: {
        ...corsHeaders,
        Location: `https://${process.env['API_URL']}/${this.getKey(cacheFileId)}`
      }
    }
  }
}
