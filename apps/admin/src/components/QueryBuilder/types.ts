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

export const AGGREGATE_FUNCTIONS = [
    {
        label: "Count",
        value: "count"
    },
    {
        label: "Sum",
        value: "sum"
    },
    {
        label: "Average",
        value: "avg"
    },
    {
        label: "Minimum",
        value: "min"   
    },
    {
        label: "Maximum",
        value: "max"
    },
    {
        label: "Median",
        value: "median"
    },
    {
        label: "Mode",
        value: "mode"
    },
    {
        label: "Standard Deviation",
        value: "stddev_pop"
    },
    {
        label: "Variance",
        value: "var_pop"
    },
    {
        label: "Skewness",
        value: "skewness"
    },
    {
        label: "Entropy",
        value: "entropy"
    },
    {
        label: "Kurtosis",
        value: "kurtosis",
    }
] as const

export type OPERATOR_TYPES = (typeof OPERATORS)[number];

export type JOIN_OPERATOR_TYPES = (typeof JOIN_OPERATORS)[number];

export type AGGREGATE_FUNCTION_TYPES = (typeof AGGREGATE_FUNCTIONS)[number]['value'];

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
    groupby?: string;
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
    aggregate?:  AGGREGATE_FUNCTION_TYPES;
};
