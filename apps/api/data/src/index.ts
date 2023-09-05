import { metricScope } from 'aws-embedded-metrics'
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda'
import Connection from './lambda/connection'
import getLogger from './lambda/logger'
import { handleMetadataQuery } from './lambda/handlers/handleMetadataQuery'
import { handleAdminTestQuery } from './lambda/handlers/handleAdminTestQuery'
import { handleOptionsRequest } from './lambda/handlers/handleOptions'
import { handleMissingId } from './lambda/handlers/handleMissingId'
import { handleStandardQuery } from './lambda/handlers/handleStandardQuery'

export const S3_BUCKET = (process.env.S3_BUCKET as string) || 'data-api-dev'
export const connection = new Connection()
export const logger = getLogger()

export const handler = metricScope(
  metrics =>
    async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
      if (event.httpMethod === 'OPTIONS') return handleOptionsRequest()

      const requestLogger = logger.child({ requestId: context.awsRequestId })
      requestLogger.debug({ event, context })
      logger.info({
        test: true
      })
      metrics.putDimensions({ Service: 'QueryService' })
      metrics.setProperty('RequestId', context.awsRequestId)

      const id = event.pathParameters?.['id']!
      const params = event?.queryStringParameters || {}

      const isMetaDataQuery = Boolean(params['__metadata__'])
      const isAdminTestQuery = params['__adminQuery__'] == 'true'
      const metadataFile = params['__metadata__']
      const token = event.headers['X-Authorization'] || event.headers['x-authorization']

      const queryDate = new Date()
      const queryStartTimestamp = queryDate.getTime()
      
      if (!connection.isInitialized) await connection.initialize()
      if (isMetaDataQuery) return await handleMetadataQuery(metadataFile!, params)
      if (isAdminTestQuery) return await handleAdminTestQuery(event.body!, params, token)
      if (!id) return handleMissingId(event)
      return handleStandardQuery(id, params, metrics, queryStartTimestamp)
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