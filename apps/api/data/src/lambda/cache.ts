import { deflate } from 'zlib'
import CacheEntity, { CacheTableEntity, cacheTable } from '../../../../core/aws/cache'
import { QueryResponse } from '../types/types'
import * as s3 from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import { logger } from '..'
import corsHeaders from '../utils/corsHeaders'
export default class CacheService {
  s3: s3.S3
  bucket: string = process.env['DATA_BUCKET']!
  region: string = process.env['AWS_REGION']!
  PK: string = ''
  SK: string = ''
  params: Record<string, unknown> = {}

  constructor(id: string, params: Record<string, unknown>) {
    this.PK = id
    this.params = params
    this.s3 = new s3.S3({ region: this.region })
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
  // @ts-ignore
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

  async putData(key: string, data: string) {
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: `cache/${key}.json`,
      ContentType: 'application/json',
      Body: data
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

  async cacheResult(data: string) {
    const fileId = nanoid()
    await Promise.all([this.cacheTable(fileId), this.putData(fileId, data)])
    return fileId
  }

  redirectToCacheFile(cacheFileId: string) {

    return {
      statusCode: 302,
      headers: {
        ...corsHeaders,
        Location: `https://${process.env['API_URL']}/cache/${cacheFileId}.json`
      }
    }
  }
}
