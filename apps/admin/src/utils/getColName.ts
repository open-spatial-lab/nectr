import { MetaColumnSchema } from '../components/QueryBuilder/types'

export const getColName = (column: Partial<MetaColumnSchema>) => `${column.sourceId}.${column.name}`
