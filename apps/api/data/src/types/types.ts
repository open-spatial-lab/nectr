import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'
import type { DatasetEntity } from '../../../graphql/src/plugins/scaffolds/datasets/types'
import type { ApiDataQueryEntity } from '../../../graphql/src/plugins/scaffolds/apiDataQueries/types'

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


export type DataView = ApiDataQueryEntity | DatasetEntity