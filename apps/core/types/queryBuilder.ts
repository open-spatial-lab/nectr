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

export type OPERATOR_TYPES = (typeof OPERATORS)[number];

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

export type SelectQuery = {
    from: string;
    fromS3?: boolean;
    columns?: string[];
    where?: WhereQuery[];
    combinedOperator?: (typeof COMBINE_OPERATORS)[number];
    limit?: number;
    offset?: number;
};

export type QueryBuilderProps = {
    files: string[];
    template: SelectQuery;
    onChangeTemplate: BindComponentRenderPropOnChange<string>;
};
