import { metricScope, Unit } from 'aws-embedded-metrics'
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda'
import Connection from './lambda/connection'
import getLogger from './lambda/logger'
import ColumnParser from './lambda/columnParser'
import Papa from 'papaparse'
import { verifyToken } from './lambda/identity'
import { QuerySchema } from 'apps/admin/src/components/QueryBuilder/types'
import { SqlBuilder } from './lambda/sqlBuilder'

const S3_BUCKET = (process.env.S3_BUCKET as string) || 'data-api-dev'
const connection = new Connection()
export const logger = getLogger()

export const handler = metricScope(
  metrics =>
    async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
      // if options return 200
      if (event.httpMethod === 'OPTIONS') {
        logger.info({ event, context })
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-Authorization',
            'Access-Control-Expose-Headers': 'Content-Type, Authorization, X-Api-Key, X-Authorization'
          },
          body: ''
        }
      }
      const requestLogger = logger.child({ requestId: context.awsRequestId })
      requestLogger.debug({ event, context })
      metrics.putDimensions({ Service: 'QueryService' })
      metrics.setProperty('RequestId', context.awsRequestId)
      const id = event.pathParameters?.['id']
      const params = event?.queryStringParameters || {}
      const metadataFile = params['__metadata__']

      const queryDate = new Date()
      const queryStartTimestamp = queryDate.getTime()

      if (!connection.isInitialized) {
        await connection.initialize()
      }

      logger.info(`Initialized connection at ${queryDate.toISOString()}`)

      if (metadataFile) {
        const metaQuery = metadataFile.includes('.parquet')
          ? `SELECT * FROM parquet_schema('s3://${S3_BUCKET}/${metadataFile}');`
          : `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 1;`

        const previewQuery = `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 10;`

        const [colData, previewData] = await Promise.all([
          connection.query(metaQuery),
          connection.query(previewQuery)
        ])

        if (colData.ok && previewData.ok) {
          const columnParser = new ColumnParser(metadataFile, colData.result)
          const body = JSON.stringify({
            columns: columnParser.formatColumns(),
            preview: previewData.result
          })
          return {
            statusCode: 200,
            body
          }
        } else {
          return {
            statusCode: 500,
            body: JSON.stringify({ columns: colData, table: previewData, params })
          }
        }
      }

      const isAdminTestQuery = params['__adminQuery__'] == 'true'
      logger.info({ isAdminTestQuery, event })
      if (isAdminTestQuery) {
        logger.info({ doingAdminQuery: true})
        // @ts-ignore
        const schema = JSON.parse(event.body) as DataView
        const token = event.headers['X-Authorization']
        if (!token) {
          return {
            statusCode: 401,
            body: JSON.stringify({
              message: 'Unauthorized'
            })
          }
        }

        const auth = await verifyToken(token)
        if (!auth.ok) {
          return {
            statusCode: 401,
            body: JSON.stringify({
              message: 'Unauthorized'
            })
          }
        }
        try {
          const queryResponse = await connection.handleQuery(schema, params)
          logger.info(queryResponse)

          if (queryResponse.ok) {
            return {
              statusCode: 200,
              body: JSON.stringify(queryResponse.result)
            }
          }
        } catch (error) {
          logger.error({ error })
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: 'Internal Server Error',
              error,
              schema,
              params
            })
          }
        }
      }

      if (!id) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Invalid request. Please send a request followed by an ID.',
            request: {
              event
            }
          })
        }
      }

      const data = await connection.handleIdQuery(id, params)
      requestLogger.info({ data, params })
      metrics.putMetric(
        'QueryDuration',
        new Date().getTime() - queryStartTimestamp,
        Unit.Milliseconds
      )
      if (data.ok) {
        const result =
          params['format'] === 'csv' ? Papa.unparse(data.result) : JSON.stringify(data.result)
        // const cacheResult
        return {
          statusCode: 200,
          body: result
        }
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ ...data, params })
        }
      }
    }
)

process.on('SIGTERM', async () => {
  logger.debug('[runtime] SIGTERM received')
  logger.debug('[runtime] cleaning up')
  logger.debug('[runtime] exiting')
  process.exit(0)
})
