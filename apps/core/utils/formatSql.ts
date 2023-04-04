import { SelectQuery } from "../types/queryBuilder";
import { QueryResponse } from "../types/queryApi";
import knex from "knex";

const S3_BUCKET = process.env.S3_BUCKET as string;
const QueryBuilder = knex({
    client: "pg"
});

export function formatSql(params: {
    template: SelectQuery;
    templateParams: { [key: string]: any };
}): QueryResponse<string, string> {
    try {
        const { template, templateParams } = params;
        const combinedOperator = template.combinedOperator || "and";
        const { limit, offset, where, columns, from, fromS3 } = template;

        const likelyFromS3 = !from.startsWith("http");
        const fromString = likelyFromS3 || fromS3 ? `s3://${S3_BUCKET}/${from}` : from;

        // console.log("FROM", fromString);

        const statement = QueryBuilder("query")
            .select(columns || "*")
            .fromRaw(`'${fromString}'`);

        limit && statement.limit(limit);
        offset && statement.offset(offset);

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
