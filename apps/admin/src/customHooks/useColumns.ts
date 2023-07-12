import React from "react";
import { SelectQuery } from "../components/QueryBuilder";
import { ColumnSchema, MetaColumnSchema } from "../components/QueryBuilder/types";
import { SourceMeta } from "../components/QueryBuilder/types";

const parseColumns = (source: SourceMeta): Array<MetaColumnSchema> => {
    const columns = source.columns;
    const parsedColumns = JSON.parse(columns) as Array<ColumnSchema>;
    const mappedColumns = parsedColumns.map(column => ({
        ...column,
        sourceId: source.id,
        sourceTitle: source.title
    } as MetaColumnSchema));
    return mappedColumns;
};

export const useColumns = (query: SelectQuery, sources: Array<SourceMeta>) => {
    const joins: any[] = []
    // let joinDatasets = [];
    // query.join?.forEach(join => {
    // const joins = query.join?.map(join => join) || [];
    const fromId = query?.from?.id;
    const columns = React.useMemo(() => {
        let columns: Array<MetaColumnSchema> = [];
        const mainSource = sources.find(source => source.id === fromId);

        if (mainSource) {
            columns = [...columns, ...parseColumns(mainSource)];
        }
        // joins.forEach(join => {
        //     const joinSource = sources.find(source => source.id === join.id);
        //     if (joinSource) {
        //         columns = [...columns, ...parseColumns(joinSource)];
        //     }
        // });
        return columns;
    }, [fromId, JSON.stringify(joins)]);
    return columns;
};
