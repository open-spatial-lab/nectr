import { MetricsLogger, Unit } from 'aws-embedded-metrics'
import { connection, logger } from '../..'
import CacheService from '../cache'
import * as Papa from 'papaparse'
import corsHeaders from '../../utils/corsHeaders'

export const handleStandardQuery = async (
  id: string,
  params: Record<string, unknown>,
  metrics: MetricsLogger,
  queryStartTimestamp: number
) => {
  const cacheService = new CacheService(id, params)
  const cachedResult = await cacheService.checkCache()
  if (cachedResult.ok && cachedResult?.result?.Item?.id) {
    return cacheService.redirectToCacheFile(cachedResult.result.Item.id)
  }

  const data = await connection.handleIdQuery(id, params)
  metrics.putMetric('QueryDuration', new Date().getTime() - queryStartTimestamp, Unit.Milliseconds)

  if (data.ok) {
    const outputCsv = params['format'] === 'csv'
    const result = outputCsv ? Papa.unparse(data.result) : JSON.stringify(data.result)
    const cacheFileId = await cacheService.cacheResult(result)
    return cacheService.redirectToCacheFile(cacheFileId)
  } else {
    return {
      statusCode: 400,
      headers: {
        ...corsHeaders
      },
      body: JSON.stringify({ ...data, params })
    }
  }
}
