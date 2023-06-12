import { ColumnSchema } from "apps/admin/src/plugins/scaffolds/dataUploads/types";
import { JOIN_OPERATOR_TYPES, JoinQuery, SelectQuery } from "../../admin/src/components/QueryBuilder/types";
import { QueryResponse } from "../types/queryApi";
import knex from "knex";

const S3_BUCKET = process.env.S3_BUCKET as string || "data-api-dev";
const QueryBuilder = knex({
    client: "pg"
});

export function parseColumnName(column: string){
    const regex = /t\d+\./
    const match = column?.match(regex)
    const table = match ? match[0].slice(0, -1) + '.' : ''
    const colName = match ? column?.replace(regex, '') : column
    return {
        table,
        colName
    }
}

export function generateColumnList(columns: SelectQuery["columns"]): string[] | string {
    if (!columns?.length) {
        return "*";
    }
    const columnsList = columns.map(col => {
        const { name, type } = col;
        let parsedColumn = ''
        // find a t followed by a number followed by a period find the text after the period
        const {
            table,
            colName
        } = parseColumnName(name!)
        switch (type) {
            case "Geometry (GeoJSON)":
                parsedColumn = `ST_GEOGFROMGEOJSON(${table}"${colName}") as ${colName}`;
                break;
            case "Geometry (WKB)":
                parsedColumn = `ST_GEOGFROMWKB(${table}"${colName}") as ${colName}`;
                break;
            case "Geometry (WKT)":
                parsedColumn = `ST_GEOGFROMTEXT(${table}"${colName}") as ${colName}`;
                break;
            default:
                const columnString = `${table}"${colName}"`;
                parsedColumn = col.aggregate ? `${col.aggregate}(${columnString})` : columnString;
        }
        return QueryBuilder.raw(parsedColumn);
    });
    // @ts-ignore
    return columnsList
}

export function generateFromString (
    from: string,
    fromS3: boolean | undefined,
    join: JoinQuery[] | undefined,
    tableName?: string
){
    const likelyFromS3 = !from.startsWith("http");
    const fromString = likelyFromS3 || fromS3 ? `'s3://${S3_BUCKET}/${from}'` : `'${from}}'`;
    const tableString = join?.length || tableName ? `${fromString} as ${tableName || 't0'}` : `${fromString}`
    return tableString
}

const knexJoinOperators: Record<JOIN_OPERATOR_TYPES, string> = {
    "inner": "innerJoin",
    "left": "leftJoin",
    "right": "rightJoin",
    "outer": "fullOuterJoin",
}

export function formatSql(params: {
    template: SelectQuery;
    templateParams: { [key: string]: any };
}): QueryResponse<string, string> {
    try {
        const { template, templateParams } = params;
        const combinedOperator = template.combinedOperator || "and";
        const { limit, offset, where, columns, from, fromS3, join, groupby } = template;

        const tableString = generateFromString(
            from,
            fromS3,
            join
        )
        const appendedColumnList = groupby ? [...columns||[], {name: groupby, type: 'Text', description: ''} as ColumnSchema] : columns!
        const columnList = generateColumnList(appendedColumnList);
        const statement = QueryBuilder("query")
            .select(columnList)
            .fromRaw(tableString);

        limit && statement.limit(limit);
        offset && statement.offset(offset);
        join && join.forEach((join: JoinQuery, i) => {
            const { from, fromS3, leftOn, rightOn, operator  } = join;
            const tableString = generateFromString(
                from,
                fromS3,
                [],
                `t${i + 1}`
            )
            const {
                table: lOnTable,
                colName: lOnColumn
            } = parseColumnName(leftOn!)
    
            const {
                table: rOnTable,
                colName: rOnColumn
            } = parseColumnName(rightOn!)

            const knexJoinFn = knexJoinOperators[operator] || "innerJoin";
            // @ts-ignore
            statement[knexJoinFn](
                QueryBuilder.raw(tableString),
                QueryBuilder.raw(`${lOnTable}"${lOnColumn}"`), 
                '=', 
                QueryBuilder.raw(`${rOnTable}"${rOnColumn}"`)
            )
        })

        groupby && statement.groupBy(groupby)

        where &&
            where.forEach((where, i) => {
                const { operator, column, value, customAlias, allowCustom } = where;
                let argValue = value;
                if (allowCustom) {
                    const valueAlias = customAlias || `${column}${i + 1}`;
                    try {
                        argValue = JSON.parse(templateParams[valueAlias]) || argValue;
                    } catch {
                        argValue = templateParams[valueAlias] || argValue;
                    }
                }

                const args = [
                    column,
                    operator,
                    ...(argValue.length === 1 || Array.isArray(argValue[0]) ? argValue : [argValue])
                ];
                let knexFunc = "where";
                if (i > 0) {
                    knexFunc = combinedOperator === "and" ? "andWhere" : "orWhere";
                }
                // @ts-ignore This is a bit of a hack, but it works.
                statement[knexFunc](...args);
            });

        const sqlString = statement.toString() + ";";

        return {
            ok: true,
            result: sqlString
        };
    } catch (error) {
        return {
            ok: false,
            error: `Error at format sql: ${error.toString()}. Template: ${
                params.template
            }. Params: ${JSON.stringify(params.templateParams)}`
        };
    }
}
