import { ColumnSchema } from "../QueryBuilder/types";

export type  ColumnSelectProps = {
  columns: ColumnSchema[];
  onChange: (column: ColumnSchema) => void,
  value: ColumnSchema
  disabled?: boolean;
  label?: string;
  children?: React.ReactNode;
} 