import React from "react";
import {
    SelectQuery,
    ColumnSchema,
    AGGREGATE_FUNCTION_TYPES,
    AGGREGATE_FUNCTIONS
} from "../QueryBuilder/types";
import { getColName } from "../../utils/getColName";
import { Select } from "@webiny/ui/Select";

export const AggregateSelector: React.FC<{
    column: ColumnSchema;
    template: SelectQuery;
    handleColumnAggregate: (
        column: ColumnSchema,
        aggregate: AGGREGATE_FUNCTION_TYPES | undefined
    ) => void;
}> = ({ column, template, handleColumnAggregate }) => {
    const colName = getColName(column);
    const templateCol = template?.columns?.find(col => col.name === colName);
    return (
        <Select
            disabled={!templateCol}
            onChange={val => handleColumnAggregate(column, val as AGGREGATE_FUNCTION_TYPES)}
            value={templateCol?.aggregate || undefined}
        >
            {[{ label: "None", value: undefined }, ...AGGREGATE_FUNCTIONS].map(
                ({ label, value }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                )
            )}
        </Select>
    );
};
