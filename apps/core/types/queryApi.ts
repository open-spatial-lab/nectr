import { APIGatewayProxyEventQueryStringParameters } from "aws-lambda"
export type ErrorResponse<Err> = {
  error: Err;
  ok: false;
}

export type SuccessResponse<Res> = {
  ok: true;
  result: Res;
}

export type QueryResponse<Res, Err> = SuccessResponse<Res> | ErrorResponse<Err>

export type SqlString = string;

export type SchemaIdAndParams = {
  id: string;
  params: APIGatewayProxyEventQueryStringParameters;
}