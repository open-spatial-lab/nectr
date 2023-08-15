import { ColumnSchema } from '../../plugins/scaffolds/datasets/types'

export type ColumnBuilderProps = {
  columns: ColumnSchema[]
  onChange: (columns: ColumnSchema[]) => void
}

export type ColumnRowProps = {
  column: ColumnSchema
  onChange: (column: ColumnSchema) => void
  onDelete: () => void
}

export type ColumnTypeProps = {
  type: ColumnSchema['type']
  onChange: (type: ColumnSchema['type']) => void
}
