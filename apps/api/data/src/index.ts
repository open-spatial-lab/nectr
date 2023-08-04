import { metricScope, Unit } from "aws-embedded-metrics";
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from "aws-lambda";
import Connection from "./lambda/connection";
import getLogger from "./lambda/logger";
import ColumnParser from "./lambda/columnParser";
import { QueryResponse } from "./types/types";
import Papa from "papaparse";

const S3_BUCKET = (process.env.S3_BUCKET as string) || "data-api-dev";
const connection = new Connection();
const logger = getLogger();

 
export const handler = metricScope(
    metrics =>
        async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
            const requestLogger = logger.child({ requestId: context.awsRequestId });
            requestLogger.debug({ event, context });
            metrics.putDimensions({ Service: "QueryService" });
            metrics.setProperty("RequestId", context.awsRequestId);
            const id = event.pathParameters?.["id"];
            const params = event?.queryStringParameters || {};
            const metadataFile = params["__metadata__"];

            const queryStartTimestamp = new Date().getTime();

            if (!connection.isInitialized) {
                await connection.initialize();
            }
            console.log("Initialized connection...")

            if (metadataFile) {
                const metaQuery = metadataFile.includes(".parquet")
                    ? `SELECT * FROM parquet_schema('s3://${S3_BUCKET}/${metadataFile}');`
                    : `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 1;`;

                const previewQuery = `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 10;`;

                const [colData, previewData] = await Promise.all([
                    connection.query(metaQuery),
                    connection.query(previewQuery)
                ]);

                if (colData.ok && previewData.ok) {
                    const columnParser = new ColumnParser(metadataFile, colData.result);
                    const body = JSON.stringify({
                        columns: columnParser.formatColumns(),
                        preview: previewData.result
                    });
                    return {
                        statusCode: 200,
                        body
                    };
                } else {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ columns: colData, table: previewData, params })
                    };
                }
            }

            const rawQuery = params["__dangerous_raw__"];
            if (rawQuery) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        data: await connection.query(rawQuery)
                    })
                };
            }

            if (!id) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "Invalid request. Please send a request followed by an ID.",
                        request: {
                            event
                        }
                    })
                };
            }
            console.log("ID", id)
            const data = await connection.handleIdQuery(id, params);
            console.log("hanlded ID")
            requestLogger.debug({ data });

            metrics.putMetric(
                "QueryDuration",
                new Date().getTime() - queryStartTimestamp,
                Unit.Milliseconds
            );

            if (data.ok) {
                const result =
                    params["format"] === "csv"
                        ? Papa.unparse(data.result)
                        : JSON.stringify(data.result);
                // const cacheResult
                return {
                    statusCode: 200,
                    body: result
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ ...data, params })
                };
            }
        }
);

process.on("SIGTERM", async () => {
    logger.debug("[runtime] SIGTERM received");
    logger.debug("[runtime] cleaning up");
    logger.debug("[runtime] exiting");
    process.exit(0);
});
