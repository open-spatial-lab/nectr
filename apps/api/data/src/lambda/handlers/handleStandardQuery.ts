import { MetricsLogger, Unit } from 'aws-embedded-metrics'
import { connection } from '../..'
import CacheService from '../cache'
import { serverSchemaService } from '../schemas/serverSchemaService'
import { authorize } from '../identity'

export const handleStandardQuery = async (
  id: string,
  params: Record<string, unknown>,
  metrics: MetricsLogger,
  queryStartTimestamp: number,
  token?: string
): Promise<ReturnType<CacheService['handleResult']>> => {
  const schema = await serverSchemaService.getSchema(id)
  if (!schema.ok) {
    throw new Error(`Schema error: ${schema.error}`)
  }
  const ttl = 'ttl' in schema.result ? schema.result.ttl || 0 : 0
  const cacheService = new CacheService(id, params, ttl)

  if (params.fresh){ 
    const authorized = await authorize(token)
    if (!authorized.ok) {
      throw new Error(`Unauthorized: ${authorized.error}`)
    }
    await cacheService.clearCacheById(id)
  }
  
  const cachedResult = await cacheService.checkCache()
  if (cachedResult.ok && cachedResult?.result?.Item?.id) {
    return cacheService.redirectToCacheFile(cachedResult.result.Item.id)
  }
  // @ts-ignore
  const data = await connection.handleQuery(schema.result, params)
  metrics.putMetric('QueryDuration', new Date().getTime() - queryStartTimestamp, Unit.Milliseconds)
  return await cacheService.handleResult(data)
}
