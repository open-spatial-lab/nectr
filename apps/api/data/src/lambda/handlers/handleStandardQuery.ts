import { MetricsLogger, Unit } from 'aws-embedded-metrics'
import { connection, logger } from '../..'
import CacheService from '../cache'
import * as Papa from 'papaparse'
import { QueryResponse } from '../../types/types'

export const handleStandardQuery = async (
  id: string,
  params: Record<string, unknown>,
  metrics: MetricsLogger,
  queryStartTimestamp: number
): Promise<QueryResponse<string, any>> => {
  // const cacheService = new CacheService(id, params)
  // const cachedResult = await cacheService.checkCache()
  // if (cachedResult.ok && cachedResult?.result?.Item?.id) {
  //   return cacheService.redirectToCacheFile(cachedResult.result.Item.id)
  // }

  const data = await connection.handleIdQuery(id, params)
  metrics.putMetric('QueryDuration', new Date().getTime() - queryStartTimestamp, Unit.Milliseconds)

  if (data.ok) {
    const outputCsv = params['format'] === 'csv'
    const result = outputCsv ? Papa.unparse(data.result) : JSON.stringify(data.result)
    return {
      ok: true,
      result
    }
  } else {
    return {
      ok: false,
      error: JSON.stringify({ ...data, params })
    }
  }
}
