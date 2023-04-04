#!/usr/bin/env ts-node
import { SelectQuery } from "../../../../../apps/admin/src/components/QueryBuilder";
import  QuerySchemas from "../schemas";

export const schemas = new QuerySchemas();

const testSchema: SelectQuery = {
  from: "test",
  columns: ['a', 'b', 'c'],
  where: [
    {
      value: ["test"],
      operator: "=",
      column: "a"
    }
  ],
  limit: 10,
  offset: 0
}

const testParams = {}

const result = schemas.formatSql({
  template: testSchema,
  templateParams: testParams
})

// console.log(result)