import { BindComponentRenderPropOnChange } from "@webiny/form/types";

export const OPERATORS = [
    "=",
    ">",
    ">=",
    "<",
    "<=",
    "Not",
    "In",
    "NotIn",
    "Null",
    "NotNull",
    // "Exists",
    // "NotExists",
    "Between",
    "NotBetween",
    "Like",
    "ILike"
] as const;

export const JOIN_OPERATORS = ["left", "right", "inner", "outer"] as const;

export type OPERATOR_TYPES = (typeof OPERATORS)[number];

export type JOIN_OPERATOR_TYPES = (typeof JOIN_OPERATORS)[number];

export type OPERATOR_ARGS = {
    "=": [string | number];
    ">": [ number];
    ">=": [number];
    "<": [number];
    "<=": [number];
    Not: [string | number];
    In: Array<string | number>;
    NotIn: Array<string | number>;
    Null: [];
    NotNull: [];
    // "Exists": [],
    // "NotExists": [],
    Between: [string | number, string | number];
    NotBetween: [string | number, string | number];
    Like: [string];
    ILike: [string];
};

export const COMBINE_OPERATORS = ["and", "or"] as const;

export type WhereQuery = {
    column: string;
    operator: OPERATOR_TYPES;
    value: OPERATOR_ARGS[OPERATOR_TYPES];
    allowCustom?: boolean;
    customAlias?: string;
};

export type JoinQuery = {
    from: string;
    fromS3?: boolean;
    leftOn: string;
    rightOn: string;
    operator: JOIN_OPERATOR_TYPES;
}

export type SelectQuery = {
    from: string;
    fromS3?: boolean;
    columns?: Partial<ColumnSchema>[];
    where?: WhereQuery[];
    combinedOperator?: (typeof COMBINE_OPERATORS)[number];
    limit?: number;
    offset?: number;
    join?: JoinQuery[];
};


export type QueryBuilderProps = {
    files: {
        title: string;
        id: string;
        filename: string;
        columns: string;
    }[];
    template: SelectQuery;
    onChangeTemplate: BindComponentRenderPropOnChange<object>;
};

export const DATA_COLUMN_TYPES = ["Text", "Number", "Date", "Boolean"] as const;

export const GEO_COLUMN_TYPES = ["Geometry (WKT)", "Geometry (GeoJSON)", "Geometry (WKB)"] as const;

export type COLUMN_TYPES = (typeof DATA_COLUMN_TYPES)[number] | (typeof GEO_COLUMN_TYPES)[number];

export type ColumnSchema = {
    name: string;
    type: COLUMN_TYPES;
    description: string;
    dataset?: string;
    datasetId?: string;
};
