import { connection, logger } from '../..'
import { verifyToken } from '../identity'

export const handleAdminTestQuery = async (
  body: string,
  params: Record<string, unknown>,
  token?: string
) => {
  const schema = JSON.parse(body!) as DataView
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Unauthorized - please provide a token in the X-Authorization header'
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

  return {
    statusCode: 500,
    body: 'Unknown error'
  }
}
