import { metricScope } from 'aws-embedded-metrics'
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda'
import Connection from './lambda/connection'
import getLogger from './lambda/logger'
import { handleMetadataQuery } from './lambda/handlers/handleMetadataQuery'
import { handleAdminTestQuery } from './lambda/handlers/handleAdminTestQuery'
import { handleOptionsRequest } from './lambda/handlers/handleOptions'
import { handleMissingId } from './lambda/handlers/handleMissingId'
import { handleStandardQuery } from './lambda/handlers/handleStandardQuery'
import CacheService from './lambda/cache'

export const S3_BUCKET = (process.env.S3_BUCKET as string) || 'data-api-dev'
export const connection = new Connection()
export const logger = getLogger()

export const handler = metricScope(
  metrics =>
    async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
      if (event.httpMethod === 'OPTIONS') return handleOptionsRequest()

      const requestLogger = logger.child({ requestId: context.awsRequestId })
      // requestLogger.debug({ event, context })
      // logger.info({
      //   test: true
      // })
      metrics.putDimensions({ Service: 'QueryService' })
      metrics.setProperty('RequestId', context.awsRequestId)

      const id = event.pathParameters?.['id']!
      const params = event?.queryStringParameters || {}

      const isMetaDataQuery = Boolean(params['__metadata__'])
      const isAdminTestQuery = params['__adminQuery__'] == 'true'
      const _metadataFile = params['__metadata__']
      const token = event.headers['X-Authorization'] || event.headers['x-authorization']

      const queryDate = new Date()
      const queryStartTimestamp = queryDate.getTime()
      
      if (!connection.isInitialized) await connection.initialize()
      if (isMetaDataQuery) {
        const metadataFile = _metadataFile ? _metadataFile : ''
        const output = await handleMetadataQuery(metadataFile, params)
        const cacheService = new CacheService(metadataFile, params)
        return await cacheService.handleResult(output)
      } else if (isAdminTestQuery) {
        const schema = JSON.parse(event.body!) as DataView | { raw: string }
        const cacheService = new CacheService(schema['raw'] || event.body!, params)
        const output = await handleAdminTestQuery(event.body!, params, token)
        return cacheService.handleResult(output)
      } else if (!id) {
        return handleMissingId(event)
      } else {
        const cacheService = new CacheService(id, params)
        const output = await handleStandardQuery(id, params, metrics, queryStartTimestamp)
        return cacheService.handleResult(output)
      }
    }
)

process.on('SIGTERM', async () => {
  logger.debug('[runtime] SIGTERM received')
  logger.debug('[runtime] cleaning up')
  logger.debug('[runtime] exiting')
  process.exit(0)
})

process.on("uncaughtException", (e) => {
  logger.error("Uncaught exception", JSON.stringify(e))
  // process.exit(1)
})