import { ColumnSchema } from "apps/admin/src/plugins/scaffolds/dataUploads/types";

const ParquetToLayFieldMapping = {
    BOOLEAN: "Boolean",
    INT32: "Number",
    INT64: "Number",
    FLOAT: "Number",
    DOUBLE: "Number",
    BYTE_ARRAY: "Text",
    FIXED_LEN_BYTE_ARRAY: "Text",
    UTF8: "Text",
    INT96: "Date and Time",
    INT_8: "Number",
    INT_16: "Number",
    INT_32: "Number",
    INT_64: "Number",
    UINT_8: "Number",
    UINT_16: "Number",
    UINT_32: "Number",
    UINT_64: "Number",
    DATE: "Date",
    TIME_MILLIS: "Number",
    TIME_MICROS: "Number",
    TIMESTAMP_MILLIS: "Date and Time",
    TIMESTAMP_MICROS: "Date and Time",
    INTERVAL: "Text",
    DECIMAL: "Number",
    LIST: "Text",
    MAP: "Text",
    MAP_KEY_VALUE: "Text",
    ENUM: "Text"
  } as const;

type csvField = { [key: string]: unknown };
type parquetField = {
    filename: string;
    name: string;
    type: keyof typeof ParquetToLayFieldMapping;
    type_length: string;
    repetition_type: string;
    num_children: number;
    converted_type: string;
    scale: number;
    precision: number;
    field_id: number;
    logical_type: string;
};


export default class ColumnParser {
    columns: Array<ColumnSchema> = [];
    forbiddenColumns: Array<string> = ["__index_level_0__", 'schema'];

    constructor(filename: string, dataResult: any) {
        this.parseColumns(filename, dataResult);
    }

    parseColumns(filename: string, dataResult: any) {
        if (filename.endsWith(".csv")) {
            this.parseCsvColumns(dataResult);
        } else if (filename.endsWith(".parquet")) {
            this.parseParquetColumns(filename, dataResult);
        }
    }

    parseParquetColumns(filename: string, dataResult: any) {
        const fields = dataResult as Array<parquetField>;
        this.columns = fields.map(
            (field: parquetField) =>
                ({
                    name: field.name,
                    type: ParquetToLayFieldMapping[field.type] || "Text",
                    description: field.name
                } as ColumnSchema)
        ).filter(col => !this.forbiddenColumns.includes(col.name));
    }

    parseCsvColumns(dataResult: any): void {
        const fields = dataResult as [csvField];
        this.columns = Object.keys(fields[0]).map(
            (key: string) =>
                ({
                    name: key,
                    type: "Text",
                    description: key
                } as ColumnSchema)
        );
    }

    formatColumns(): string {
        return JSON.stringify(this.columns);
    }
}
