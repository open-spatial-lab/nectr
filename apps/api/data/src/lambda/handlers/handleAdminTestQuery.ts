import { TableData } from 'duckdb'
import { S3_BUCKET, connection, logger } from '../..'
import { QueryResponse } from '../../types/types'
import {authorize} from "../identity"
// regex to replace "%BUCKET%" with the bucket name
const bucketRegex = new RegExp('%BUCKET%', 'g')
// replace new lines with spaces
const newLineRegex = new RegExp('\n', 'g')
const handleRawString = (str: string) => str.replace(bucketRegex, S3_BUCKET).replace(newLineRegex, ' ')

export const handleAdminTestQuery = async (
  body: string,
  params: Record<string, unknown>,
  token?: string
): Promise<QueryResponse<TableData, string>> => {
  const schema = JSON.parse(body!) as DataView | { raw: string }
  const authorized = await authorize(token)
  if (!authorized.ok) {
    throw new Error(`Unauthorized: ${authorized.error}`)
  }
  let error = ''
  try {
    const queryResponse =
      'raw' in schema
        ? await connection.query(handleRawString(schema.raw))
        : await connection.handleQuery(schema, params)
    if (queryResponse.ok) {
      return {
        ok: true,
        result: queryResponse.result
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
      ok: false,
      error: JSON.stringify({
        message: 'Internal Server Error',
        error,
        schema,
        params
      })
    }
  }

  return {
    ok: false,
    error: JSON.stringify({
      message: 'Internal Server Error',
      error,
      schema
    })
  }
}
