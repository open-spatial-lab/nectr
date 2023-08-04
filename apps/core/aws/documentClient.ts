import { DocumentClient } from 'aws-sdk/clients/dynamodb'

export const documentClient = new DocumentClient({
  convertEmptyValues: true,
  region: process.env.AWS_REGION
})
