import { Entity } from 'dynamodb-toolbox'
import table from '../../../../core/aws/table';

export interface ResultCacheSchema {
  PK: string;
  SK: string;
  id: string;
  createdOn: string;
  content: string;
}

export const ResultCacheEntity = new Entity({
  table,
  name: "ResultCache",
  timestamps: true,
  attributes: {
      PK: { partitionKey: true },
      SK: { sortKey: true },
      id: { type: "string" },
      createdOn: { type: "string" },
      content: { type: "string" }
  }
});