import { S3_BUCKET, connection, logger } from '../..'
import corsHeaders from '../../utils/corsHeaders'
import { verifyToken } from '../identity'

// regex to replace "%BUCKET%" with the bucket name
const bucketRegex = new RegExp('%BUCKET%', 'g')
// replace new lines with spaces
const newLineRegex = new RegExp('\n', 'g')
const handleRawString = (str: string) => str.replace(bucketRegex, S3_BUCKET).replace(newLineRegex, ' ')

export const handleAdminTestQuery = async (
  body: string,
  params: Record<string, unknown>,
  token?: string
) => {
  const schema = JSON.parse(body!) as DataView | { raw: string }
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        ...corsHeaders
      },
      body: JSON.stringify({
        message: 'Unauthorized - please provide a token in the X-Authorization header'
      })
    }
  }

  const auth = await verifyToken(token)
  if (!auth.ok) {
    return {
      statusCode: 401,
      headers: {
        ...corsHeaders
      },
      body: JSON.stringify({
        message: 'Unauthorized'
      })
    }
  }
  let error = ''
  try {
    const queryResponse =
      'raw' in schema
        ? await connection.query(handleRawString(schema.raw))
        : await connection.handleQuery(schema, params)
    // logger.info(queryResponse)
    if (queryResponse.ok) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders
        },
        body: JSON.stringify(queryResponse.result)
      }
    }
  } catch (error) {
    error = error.message
    logger.error({
      message: 'Error handling query',
      error,
      schema,
      params
    })
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders
      },
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
    headers: {
      ...corsHeaders
    },
    body: JSON.stringify({
      message: 'Internal Server Error',
      error,
      schema
    })
  }
}
