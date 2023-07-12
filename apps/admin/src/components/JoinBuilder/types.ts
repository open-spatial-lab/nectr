import { ColumnSchema } from "../../plugins/scaffolds/datasets/types"
import { JoinQuery, QueryBuilderProps, SelectQuery } from "../QueryBuilder"

export type JoinBuilderProps = {
  template: SelectQuery
  join: JoinQuery
  files: QueryBuilderProps['sources']
  handleTemplateChange: <T extends keyof SelectQuery>(key: T, value: SelectQuery[T]) => void
  columns: ColumnSchema[]
  idx: number
}