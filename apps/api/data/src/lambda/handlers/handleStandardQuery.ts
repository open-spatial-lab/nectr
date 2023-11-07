import { MetricsLogger, Unit } from 'aws-embedded-metrics'
import { connection, logger } from '../..'
import { QueryResponse } from '../../types/types'
import { TableData } from 'duckdb'

export const handleStandardQuery = async (
  id: string,
  params: Record<string, unknown>,
  metrics: MetricsLogger,
  queryStartTimestamp: number
): Promise<QueryResponse<TableData, unknown>> => {
  // const cacheService = new CacheService(id, params)
  // const cachedResult = await cacheService.checkCache()
  // if (cachedResult.ok && cachedResult?.result?.Item?.id) {
  //   return cacheService.redirectToCacheFile(cachedResult.result.Item.id)
  // }

  const data = await connection.handleIdQuery(id, params)
  metrics.putMetric('QueryDuration', new Date().getTime() - queryStartTimestamp, Unit.Milliseconds)

  if (data.ok) {
    return {
      ok: true,
      result: data.result
    }
  } else {
    return {
      ok: false,
      error: JSON.stringify({ ...data, params })
    }
  }
}
