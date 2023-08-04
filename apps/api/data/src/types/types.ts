import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'

export type QueryResponse<Res, Err> =
  | {
      result: Res
      ok: true
    }
  | {
      error: Err
      ok: false
    }

export type SqlString = string

export type SchemaIdAndParams = {
  id: string
  params: APIGatewayProxyEventQueryStringParameters
}
